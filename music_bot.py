import discord
from discord.ext import commands
import yt_dlp
import asyncio
import os
from dotenv import load_dotenv
import logging
from collections import deque
import json

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration yt-dlp
ytdl_format_options = {
    'format': 'bestaudio/best',
    'outtmpl': '%(extractor)s-%(id)s-%(title)s.%(ext)s',
    'restrictfilenames': True,
    'noplaylist': True,
    'nocheckcertificate': True,
    'ignoreerrors': False,
    'logtostderr': False,
    'quiet': True,
    'no_warnings': True,
    'default_search': 'auto',
    'source_address': '0.0.0.0',
    'extract_flat': False,
    'writethumbnail': False,
    'writeinfojson': False,
}

ffmpeg_options = {
    'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
    'options': '-vn'
}

ytdl = yt_dlp.YoutubeDL(ytdl_format_options)

class YTDLSource(discord.PCMVolumeTransformer):
    def __init__(self, source, *, data, volume=0.5):
        super().__init__(source, volume)
        self.data = data
        self.title = data.get('title')
        self.url = data.get('url')
        self.duration = data.get('duration')
        self.thumbnail = data.get('thumbnail')
        self.uploader = data.get('uploader')

    @classmethod
    async def from_url(cls, url, *, loop=None, stream=False):
        loop = loop or asyncio.get_event_loop()
        try:
            data = await loop.run_in_executor(None, lambda: ytdl.extract_info(url, download=not stream))
            
            if 'entries' in data:
                # Prendre la première entrée si c'est une playlist
                data = data['entries'][0]
            
            filename = data['url'] if stream else ytdl.prepare_filename(data)
            return cls(discord.FFmpegPCMAudio(filename, **ffmpeg_options), data=data)
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de l'URL {url}: {e}")
            raise

class MusicPlayer:
    def __init__(self, ctx):
        self.ctx = ctx
        self.bot = ctx.bot
        self.guild = ctx.guild
        self.channel = ctx.channel
        self.voice_client = None
        
        self.queue = deque()
        self.current = None
        self.volume = float(os.getenv('DEFAULT_VOLUME', 0.5))
        self.is_playing = False
        self.is_paused = False
        self.loop = False
        self.loop_queue = False
        
    async def connect(self, voice_channel):
        """Se connecter au canal vocal"""
        if self.voice_client is None:
            self.voice_client = await voice_channel.connect()
        else:
            await self.voice_client.move_to(voice_channel)
    
    async def disconnect(self):
        """Se déconnecter du canal vocal"""
        if self.voice_client:
            await self.voice_client.disconnect()
            self.voice_client = None
    
    def add_to_queue(self, source):
        """Ajouter une source à la queue"""
        self.queue.append(source)
    
    async def play_next(self):
        """Jouer la prochaine chanson"""
        if self.loop and self.current:
            # Rejouer la chanson actuelle
            source = self.current
        elif self.queue:
            # Jouer la prochaine chanson de la queue
            source = self.queue.popleft()
            if self.loop_queue:
                self.queue.append(source)
        else:
            # Aucune chanson à jouer
            self.is_playing = False
            self.current = None
            return
        
        self.current = source
        self.is_playing = True
        self.is_paused = False
        
        # Ajuster le volume
        source.volume = self.volume
        
        # Jouer la chanson
        self.voice_client.play(source, after=lambda e: self.bot.loop.create_task(self.play_next()) if e else self.bot.loop.create_task(self.play_next()))
        
        # Envoyer un message avec les informations de la chanson
        embed = discord.Embed(
            title="🎵 Lecture en cours",
            description=f"**{source.title}**",
            color=discord.Color.blue()
        )
        if source.thumbnail:
            embed.set_thumbnail(url=source.thumbnail)
        if source.uploader:
            embed.add_field(name="Uploader", value=source.uploader, inline=True)
        if source.duration:
            minutes, seconds = divmod(source.duration, 60)
            embed.add_field(name="Durée", value=f"{int(minutes):02d}:{int(seconds):02d}", inline=True)
        
        await self.channel.send(embed=embed)
    
    async def pause(self):
        """Mettre en pause"""
        if self.voice_client and self.voice_client.is_playing():
            self.voice_client.pause()
            self.is_paused = True
    
    async def resume(self):
        """Reprendre la lecture"""
        if self.voice_client and self.voice_client.is_paused():
            self.voice_client.resume()
            self.is_paused = False
    
    async def stop(self):
        """Arrêter la lecture"""
        if self.voice_client:
            self.voice_client.stop()
        self.queue.clear()
        self.current = None
        self.is_playing = False
        self.is_paused = False
    
    async def skip(self):
        """Passer à la chanson suivante"""
        if self.voice_client and self.voice_client.is_playing():
            self.voice_client.stop()

class MusicBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.voice_states = True
        
        super().__init__(
            command_prefix=os.getenv('COMMAND_PREFIX', '!'),
            intents=intents,
            help_command=None
        )
        
        self.players = {}
    
    async def on_ready(self):
        logger.info(f'{self.user} est connecté à Discord!')
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.listening,
                name=os.getenv('BOT_STATUS', 'Écoute de la musique 🎵')
            )
        )
    
    def get_player(self, ctx):
        """Obtenir le player pour un serveur"""
        if ctx.guild.id not in self.players:
            self.players[ctx.guild.id] = MusicPlayer(ctx)
        return self.players[ctx.guild.id]

bot = MusicBot()

@bot.command(name='play', aliases=['p'])
async def play(ctx, *, query):
    """Jouer une chanson depuis YouTube"""
    if not ctx.author.voice:
        await ctx.send("❌ Vous devez être dans un canal vocal pour utiliser cette commande!")
        return
    
    voice_channel = ctx.author.voice.channel
    player = bot.get_player(ctx)
    
    # Se connecter au canal vocal
    await player.connect(voice_channel)
    
    # Message de chargement
    loading_msg = await ctx.send("🔍 Recherche en cours...")
    
    try:
        # Extraire les informations de la vidéo
        source = await YTDLSource.from_url(query, loop=bot.loop, stream=True)
        
        if player.is_playing:
            # Ajouter à la queue
            player.add_to_queue(source)
            embed = discord.Embed(
                title="📝 Ajouté à la queue",
                description=f"**{source.title}**",
                color=discord.Color.green()
            )
            embed.add_field(name="Position", value=len(player.queue), inline=True)
            await loading_msg.edit(content="", embed=embed)
        else:
            # Jouer immédiatement
            player.add_to_queue(source)
            await player.play_next()
            await loading_msg.delete()
    
    except Exception as e:
        await loading_msg.edit(content=f"❌ Erreur lors de la lecture: {str(e)}")

@bot.command(name='pause')
async def pause(ctx):
    """Mettre en pause la lecture"""
    player = bot.get_player(ctx)
    if player.is_playing and not player.is_paused:
        await player.pause()
        await ctx.send("⏸️ Lecture mise en pause")
    else:
        await ctx.send("❌ Aucune musique en cours de lecture")

@bot.command(name='resume')
async def resume(ctx):
    """Reprendre la lecture"""
    player = bot.get_player(ctx)
    if player.is_paused:
        await player.resume()
        await ctx.send("▶️ Lecture reprise")
    else:
        await ctx.send("❌ La lecture n'est pas en pause")

@bot.command(name='stop')
async def stop(ctx):
    """Arrêter la lecture et vider la queue"""
    player = bot.get_player(ctx)
    await player.stop()
    await ctx.send("⏹️ Lecture arrêtée et queue vidée")

@bot.command(name='skip', aliases=['s'])
async def skip(ctx):
    """Passer à la chanson suivante"""
    player = bot.get_player(ctx)
    if player.is_playing:
        await player.skip()
        await ctx.send("⏭️ Chanson passée")
    else:
        await ctx.send("❌ Aucune musique en cours de lecture")

@bot.command(name='queue', aliases=['q'])
async def queue(ctx):
    """Afficher la queue actuelle"""
    player = bot.get_player(ctx)
    
    if not player.queue and not player.current:
        await ctx.send("📝 La queue est vide")
        return
    
    embed = discord.Embed(title="📝 Queue de lecture", color=discord.Color.blue())
    
    if player.current:
        embed.add_field(
            name="🎵 En cours de lecture",
            value=f"**{player.current.title}**",
            inline=False
        )
    
    if player.queue:
        queue_list = []
        for i, source in enumerate(list(player.queue)[:10], 1):
            queue_list.append(f"{i}. **{source.title}**")
        
        embed.add_field(
            name="📋 Prochaines chansons",
            value="\n".join(queue_list),
            inline=False
        )
        
        if len(player.queue) > 10:
            embed.add_field(
                name="ℹ️",
                value=f"... et {len(player.queue) - 10} autres chansons",
                inline=False
            )
    
    await ctx.send(embed=embed)

@bot.command(name='volume', aliases=['v'])
async def volume(ctx, volume: int = None):
    """Changer le volume (0-100)"""
    player = bot.get_player(ctx)
    
    if volume is None:
        await ctx.send(f"🔊 Volume actuel: {int(player.volume * 100)}%")
        return
    
    if volume < 0 or volume > 100:
        await ctx.send("❌ Le volume doit être entre 0 et 100")
        return
    
    player.volume = volume / 100
    if player.current:
        player.current.volume = player.volume
    
    await ctx.send(f"🔊 Volume ajusté à {volume}%")

@bot.command(name='loop')
async def loop(ctx):
    """Activer/désactiver la répétition de la chanson actuelle"""
    player = bot.get_player(ctx)
    player.loop = not player.loop
    
    status = "activée" if player.loop else "désactivée"
    emoji = "🔂" if player.loop else "➡️"
    await ctx.send(f"{emoji} Répétition de la chanson {status}")

@bot.command(name='loopqueue')
async def loop_queue(ctx):
    """Activer/désactiver la répétition de la queue"""
    player = bot.get_player(ctx)
    player.loop_queue = not player.loop_queue
    
    status = "activée" if player.loop_queue else "désactivée"
    emoji = "🔁" if player.loop_queue else "➡️"
    await ctx.send(f"{emoji} Répétition de la queue {status}")

@bot.command(name='nowplaying', aliases=['np'])
async def now_playing(ctx):
    """Afficher les informations de la chanson actuelle"""
    player = bot.get_player(ctx)
    
    if not player.current:
        await ctx.send("❌ Aucune musique en cours de lecture")
        return
    
    source = player.current
    embed = discord.Embed(
        title="🎵 Lecture en cours",
        description=f"**{source.title}**",
        color=discord.Color.blue()
    )
    
    if source.thumbnail:
        embed.set_thumbnail(url=source.thumbnail)
    if source.uploader:
        embed.add_field(name="Uploader", value=source.uploader, inline=True)
    if source.duration:
        minutes, seconds = divmod(source.duration, 60)
        embed.add_field(name="Durée", value=f"{int(minutes):02d}:{int(seconds):02d}", inline=True)
    
    embed.add_field(name="Volume", value=f"{int(player.volume * 100)}%", inline=True)
    embed.add_field(name="Répétition", value="🔂" if player.loop else "➡️", inline=True)
    embed.add_field(name="Queue en boucle", value="🔁" if player.loop_queue else "➡️", inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='disconnect', aliases=['dc'])
async def disconnect(ctx):
    """Déconnecter le bot du canal vocal"""
    player = bot.get_player(ctx)
    await player.stop()
    await player.disconnect()
    await ctx.send("👋 Déconnecté du canal vocal")

@bot.command(name='help', aliases=['h'])
async def help_command(ctx):
    """Afficher les commandes disponibles"""
    embed = discord.Embed(
        title="🎵 OpiozenMusic - Commandes",
        description="Bot de musique Discord sans API externe",
        color=discord.Color.blue()
    )
    
    commands_list = [
        ("!play <recherche>", "Jouer une chanson depuis YouTube"),
        ("!pause", "Mettre en pause la lecture"),
        ("!resume", "Reprendre la lecture"),
        ("!stop", "Arrêter la lecture et vider la queue"),
        ("!skip", "Passer à la chanson suivante"),
        ("!queue", "Afficher la queue de lecture"),
        ("!volume <0-100>", "Changer le volume"),
        ("!loop", "Répéter la chanson actuelle"),
        ("!loopqueue", "Répéter la queue"),
        ("!nowplaying", "Informations sur la chanson actuelle"),
        ("!disconnect", "Déconnecter le bot"),
    ]
    
    for command, description in commands_list:
        embed.add_field(name=command, value=description, inline=False)
    
    embed.set_footer(text="Créé pour Raspberry Pi 4 | Aucune API externe requise")
    await ctx.send(embed=embed)

# Gestion des erreurs
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("❌ Arguments manquants. Utilisez `!help` pour voir les commandes.")
    elif isinstance(error, commands.CommandNotFound):
        await ctx.send("❌ Commande introuvable. Utilisez `!help` pour voir les commandes disponibles.")
    else:
        logger.error(f"Erreur de commande: {error}")
        await ctx.send(f"❌ Une erreur s'est produite: {str(error)}")

if __name__ == "__main__":
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        logger.error("Token Discord manquant! Veuillez configurer DISCORD_TOKEN dans le fichier .env")
        exit(1)
    
    try:
        bot.run(token)
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du bot: {e}")
