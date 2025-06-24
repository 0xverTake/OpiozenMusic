import discord
from discord.ext import commands
import yt_dlp
import asyncio
import os
from dotenv import load_dotenv
import logging
from collections import deque
import json
import re
import random
import time
import requests
from urllib.parse import quote, unquote
import subprocess
import tempfile

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Liste des User-Agents pour rotation
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

def get_random_user_agent():
    return random.choice(USER_AGENTS)

# Configuration yt-dlp avancée avec contournements
def get_ytdl_options():
    return {
        'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
        'outtmpl': '%(extractor)s-%(id)s-%(title)s.%(ext)s',
        'restrictfilenames': True,
        'noplaylist': True,
        'nocheckcertificate': True,
        'ignoreerrors': False,
        'logtostderr': False,
        'quiet': True,
        'no_warnings': True,
        'default_search': 'ytsearch',
        'source_address': '0.0.0.0',
        'extract_flat': False,
        'writethumbnail': False,
        'writeinfojson': False,
        'prefer_insecure': True,
        'age_limit': None,
        'geo_bypass': True,
        'geo_bypass_country': 'US',
        'cookiefile': 'cookies.txt',
        # Contournement des restrictions
        'extractor_args': {
            'youtube': {
                'skip': ['hls', 'dash'],
                'player_skip': ['configs', 'webpage'],
                'player_client': ['android', 'web'],
                'include_hls_manifest': False,
                'include_dash_manifest': False
            }
        },
        # Headers rotatifs
        'http_headers': {
            'User-Agent': get_random_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        },
        # Options de proxy si nécessaire
        'proxy': os.getenv('PROXY_URL', None),
        # Retry options
        'retries': 10,
        'fragment_retries': 10,
        'extractor_retries': 5,
        'retry_sleep_functions': {
            'http': lambda n: min(4 ** n, 60),
            'fragment': lambda n: min(2 ** n, 30),
            'extractor': lambda n: min(2 ** n, 120)
        }
    }

ffmpeg_options = {
    'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5 -analyzeduration 0 -probesize 32',
    'options': '-vn -b:a 128k'
}

class AlternativeSource:
    """Classe pour gérer les sources alternatives"""
    
    @staticmethod
    async def search_soundcloud(query):
        """Recherche sur SoundCloud"""
        try:
            ytdl_opts = get_ytdl_options()
            ytdl_opts['default_search'] = 'scsearch'
            ytdl = yt_dlp.YoutubeDL(ytdl_opts)
            
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, lambda: ytdl.extract_info(f"scsearch5:{query}", download=False))
            
            if 'entries' in data and data['entries']:
                return data['entries'][0]
            return None
        except Exception as e:
            logger.error(f"Erreur SoundCloud: {e}")
            return None
    
    @staticmethod
    async def search_bandcamp(query):
        """Recherche sur Bandcamp"""
        try:
            ytdl_opts = get_ytdl_options()
            ytdl_opts['default_search'] = 'bcsearch'
            ytdl = yt_dlp.YoutubeDL(ytdl_opts)
            
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, lambda: ytdl.extract_info(f"bcsearch5:{query}", download=False))
            
            if 'entries' in data and data['entries']:
                return data['entries'][0]
            return None
        except Exception as e:
            logger.error(f"Erreur Bandcamp: {e}")
            return None
    
    @staticmethod
    async def search_vimeo(query):
        """Recherche sur Vimeo"""
        try:
            # Recherche via API Vimeo (nécessite une clé API)
            api_key = os.getenv('VIMEO_API_KEY')
            if not api_key:
                return None
                
            headers = {'Authorization': f'bearer {api_key}'}
            response = requests.get(f'https://api.vimeo.com/videos?query={quote(query)}&per_page=1', headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('data'):
                    video = data['data'][0]
                    return {
                        'title': video['name'],
                        'url': video['link'],
                        'duration': video.get('duration', 0),
                        'thumbnail': video.get('pictures', {}).get('base_link'),
                        'uploader': video.get('user', {}).get('name')
                    }
            return None
        except Exception as e:
            logger.error(f"Erreur Vimeo: {e}")
            return None

class YTDLSource(discord.PCMVolumeTransformer):
    def __init__(self, source, *, data, volume=0.5):
        super().__init__(source, volume)
        self.data = data
        self.title = data.get('title')
        self.url = data.get('url')
        self.duration = data.get('duration')
        self.thumbnail = data.get('thumbnail')
        self.uploader = data.get('uploader')
        self.source_type = data.get('extractor', 'unknown')

    @classmethod
    async def from_url(cls, url, *, loop=None, stream=True):
        loop = loop or asyncio.get_event_loop()
        
        # Tentatives multiples avec différentes configurations
        attempts = [
            get_ytdl_options(),
            {**get_ytdl_options(), 'format': 'worst'},
            {**get_ytdl_options(), 'format': 'bestaudio[height<=720]/best[height<=720]'},
        ]
        
        for i, ytdl_opts in enumerate(attempts):
            try:
                ytdl = yt_dlp.YoutubeDL(ytdl_opts)
                
                # Ajouter un délai entre les tentatives
                if i > 0:
                    await asyncio.sleep(random.uniform(1, 3))
                
                data = await loop.run_in_executor(None, lambda: ytdl.extract_info(url, download=not stream))
                
                if 'entries' in data:
                    # Prendre la première entrée si c'est une recherche
                    if data['entries']:
                        data = data['entries'][0]
                    else:
                        raise Exception("Aucun résultat trouvé")
                
                if not data.get('url'):
                    raise Exception("URL non disponible")
                
                filename = data['url'] if stream else ytdl.prepare_filename(data)
                return cls(discord.FFmpegPCMAudio(filename, **ffmpeg_options), data=data)
                
            except Exception as e:
                logger.warning(f"Tentative {i+1} échouée: {e}")
                if i == len(attempts) - 1:
                    # Dernière tentative échouée, essayer les sources alternatives
                    raise
        
        # Si toutes les tentatives échouent
        raise Exception("Impossible d'extraire l'audio après plusieurs tentatives")

    @classmethod
    async def search_alternative_sources(cls, query, *, loop=None):
        """Recherche dans les sources alternatives"""
        loop = loop or asyncio.get_event_loop()
        
        # Essayer différentes sources
        sources = [
            ("SoundCloud", AlternativeSource.search_soundcloud),
            ("Bandcamp", AlternativeSource.search_bandcamp),
            ("Vimeo", AlternativeSource.search_vimeo),
        ]
        
        for source_name, search_func in sources:
            try:
                logger.info(f"Recherche sur {source_name}...")
                result = await search_func(query)
                if result:
                    logger.info(f"Trouvé sur {source_name}: {result.get('title', 'Titre inconnu')}")
                    return await cls.from_url(result['url'], loop=loop)
            except Exception as e:
                logger.warning(f"Erreur {source_name}: {e}")
                continue
        
        return None

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
        self.shuffle = False
        
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
        if self.shuffle:
            # Insérer à une position aléatoire
            pos = random.randint(0, len(self.queue))
            self.queue.insert(pos, source)
        else:
            self.queue.append(source)
    
    async def play_next(self):
        """Jouer la prochaine chanson"""
        if self.loop and self.current:
            # Rejouer la chanson actuelle
            try:
                # Recréer la source pour éviter les erreurs de lecture
                new_source = await YTDLSource.from_url(f"ytsearch:{self.current.title}")
                source = new_source
            except:
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
        def after_playing(error):
            if error:
                logger.error(f"Erreur de lecture: {error}")
            future = asyncio.run_coroutine_threadsafe(self.play_next(), self.bot.loop)
            try:
                future.result()
            except Exception as e:
                logger.error(f"Erreur dans after_playing: {e}")
        
        self.voice_client.play(source, after=after_playing)
        
        # Envoyer un message avec les informations de la chanson
        embed = discord.Embed(
            title="🎵 Lecture en cours",
            description=f"**{source.title}**",
            color=discord.Color.blue()
        )
        
        if hasattr(source, 'source_type'):
            embed.add_field(name="Source", value=source.source_type.upper(), inline=True)
        
        if source.thumbnail:
            embed.set_thumbnail(url=source.thumbnail)
        if source.uploader:
            embed.add_field(name="Artiste/Uploader", value=source.uploader, inline=True)
        if source.duration:
            minutes, seconds = divmod(source.duration, 60)
            embed.add_field(name="Durée", value=f"{int(minutes):02d}:{int(seconds):02d}", inline=True)
        
        embed.add_field(name="Volume", value=f"{int(self.volume * 100)}%", inline=True)
        
        status_icons = []
        if self.loop:
            status_icons.append("🔂")
        if self.loop_queue:
            status_icons.append("🔁")
        if self.shuffle:
            status_icons.append("🔀")
        
        if status_icons:
            embed.add_field(name="Mode", value=" ".join(status_icons), inline=True)
        
        try:
            await self.channel.send(embed=embed)
        except Exception as e:
            logger.error(f"Erreur envoi embed: {e}")
    
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
        self.failed_queries = set()  # Cache des requêtes échouées
    
    async def on_ready(self):
        logger.info(f'{self.user} est connecté à Discord!')
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.listening,
                name=os.getenv('BOT_STATUS', 'Multi-sources 🎵')
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
    """Jouer une chanson depuis multiple sources"""
    if not ctx.author.voice:
        await ctx.send("❌ Vous devez être dans un canal vocal pour utiliser cette commande!")
        return
    
    voice_channel = ctx.author.voice.channel
    player = bot.get_player(ctx)
    
    # Se connecter au canal vocal
    await player.connect(voice_channel)
    
    # Message de chargement
    loading_msg = await ctx.send("🔍 Recherche en cours...")
    
    # Éviter les requêtes déjà échouées récemment
    query_hash = hash(query.lower())
    if query_hash in bot.failed_queries:
        await loading_msg.edit(content="❌ Cette recherche a récemment échoué. Essayez une autre requête.")
        return
    
    try:
        source = None
        
        # Essayer d'abord YouTube
        try:
            await loading_msg.edit(content="🔍 Recherche sur YouTube...")
            source = await YTDLSource.from_url(f"ytsearch:{query}", loop=bot.loop)
        except Exception as e:
            logger.warning(f"YouTube échoué: {e}")
            
            # Essayer les sources alternatives
            await loading_msg.edit(content="🔍 Recherche sur sources alternatives...")
            source = await YTDLSource.search_alternative_sources(query, loop=bot.loop)
        
        if not source:
            bot.failed_queries.add(query_hash)
            # Nettoyer le cache après un certain temps
            asyncio.create_task(remove_failed_query_later(query_hash))
            raise Exception("Aucune source trouvée sur toutes les plateformes")
        
        if player.is_playing:
            # Ajouter à la queue
            player.add_to_queue(source)
            embed = discord.Embed(
                title="📝 Ajouté à la queue",
                description=f"**{source.title}**",
                color=discord.Color.green()
            )
            embed.add_field(name="Position", value=len(player.queue), inline=True)
            if hasattr(source, 'source_type'):
                embed.add_field(name="Source", value=source.source_type.upper(), inline=True)
            await loading_msg.edit(content="", embed=embed)
        else:
            # Jouer immédiatement
            player.add_to_queue(source)
            await player.play_next()
            await loading_msg.delete()
    
    except Exception as e:
        error_msg = str(e)
        if "Sign in to confirm" in error_msg:
            await loading_msg.edit(content="❌ YouTube demande une authentification. Essayez avec une autre recherche ou utilisez `!alternative <recherche>`")
        else:
            await loading_msg.edit(content=f"❌ Erreur lors de la lecture: {error_msg}")

async def remove_failed_query_later(query_hash):
    """Retirer une requête échouée du cache après 5 minutes"""
    await asyncio.sleep(300)  # 5 minutes
    bot.failed_queries.discard(query_hash)

@bot.command(name='alternative', aliases=['alt'])
async def alternative_search(ctx, *, query):
    """Rechercher uniquement dans les sources alternatives"""
    if not ctx.author.voice:
        await ctx.send("❌ Vous devez être dans un canal vocal pour utiliser cette commande!")
        return
    
    voice_channel = ctx.author.voice.channel
    player = bot.get_player(ctx)
    
    await player.connect(voice_channel)
    
    loading_msg = await ctx.send("🔍 Recherche dans les sources alternatives...")
    
    try:
        source = await YTDLSource.search_alternative_sources(query, loop=bot.loop)
        
        if not source:
            raise Exception("Aucune source alternative trouvée")
        
        if player.is_playing:
            player.add_to_queue(source)
            embed = discord.Embed(
                title="📝 Ajouté à la queue (source alternative)",
                description=f"**{source.title}**",
                color=discord.Color.green()
            )
            embed.add_field(name="Position", value=len(player.queue), inline=True)
            await loading_msg.edit(content="", embed=embed)
        else:
            player.add_to_queue(source)
            await player.play_next()
            await loading_msg.delete()
    
    except Exception as e:
        await loading_msg.edit(content=f"❌ Erreur sources alternatives: {str(e)}")

@bot.command(name='shuffle')
async def shuffle(ctx):
    """Activer/désactiver le mode shuffle"""
    player = bot.get_player(ctx)
    player.shuffle = not player.shuffle
    
    status = "activé" if player.shuffle else "désactivé"
    emoji = "🔀" if player.shuffle else "➡️"
    await ctx.send(f"{emoji} Mode shuffle {status}")
    
    if player.shuffle and len(player.queue) > 1:
        # Mélanger la queue actuelle
        queue_list = list(player.queue)
        random.shuffle(queue_list)
        player.queue = deque(queue_list)
        await ctx.send("🔀 Queue mélangée!")

@bot.command(name='sources')
async def sources_info(ctx):
    """Afficher les sources de musique disponibles"""
    embed = discord.Embed(
        title="🎵 Sources de musique disponibles",
        description="OpiozenMusic supporte plusieurs plateformes",
        color=discord.Color.blue()
    )
    
    sources = [
        ("🎥 YouTube", "Recherche automatique avec contournement des restrictions"),
        ("🎧 SoundCloud", "Musique indépendante et remixes"),
        ("🎤 Bandcamp", "Musique d'artistes indépendants"),
        ("📹 Vimeo", "Contenu vidéo alternatif (nécessite clé API)"),
    ]
    
    for name, desc in sources:
        embed.add_field(name=name, value=desc, inline=False)
    
    embed.add_field(
        name="💡 Conseils",
        value="• Utilisez `!play` pour la recherche automatique\n• Utilisez `!alternative` pour forcer les sources alternatives\n• Le bot essaie automatiquement plusieurs sources en cas d'échec",
        inline=False
    )
    
    await ctx.send(embed=embed)

# Commandes existantes (pause, resume, stop, etc.)
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
        current_info = f"**{player.current.title}**"
        if hasattr(player.current, 'source_type'):
            current_info += f" ({player.current.source_type.upper()})"
        embed.add_field(
            name="🎵 En cours de lecture",
            value=current_info,
            inline=False
        )
    
    if player.queue:
        queue_list = []
        for i, source in enumerate(list(player.queue)[:10], 1):
            source_info = f"**{source.title}**"
            if hasattr(source, 'source_type'):
                source_info += f" ({source.source_type.upper()})"
            queue_list.append(f"{i}. {source_info}")
        
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
    
    # Afficher les modes actifs
    modes = []
    if player.loop:
        modes.append("🔂 Répétition")
    if player.loop_queue:
        modes.append("🔁 Queue en boucle")
    if player.shuffle:
        modes.append("🔀 Shuffle")
    
    if modes:
        embed.add_field(name="🎛️ Modes actifs", value=" | ".join(modes), inline=False)
    
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
    
    if hasattr(source, 'source_type'):
        embed.add_field(name="Source", value=source.source_type.upper(), inline=True)
    
    if source.thumbnail:
        embed.set_thumbnail(url=source.thumbnail)
    if source.uploader:
        embed.add_field(name="Artiste/Uploader", value=source.uploader, inline=True)
    if source.duration:
        minutes, seconds = divmod(source.duration, 60)
        embed.add_field(name="Durée", value=f"{int(minutes):02d}:{int(seconds):02d}", inline=True)
    
    embed.add_field(name="Volume", value=f"{int(player.volume * 100)}%", inline=True)
    
    modes = []
    if player.loop:
        modes.append("🔂")
    if player.loop_queue:
        modes.append("🔁")
    if player.shuffle:
        modes.append("🔀")
    
    if modes:
        embed.add_field(name="Modes", value=" ".join(modes), inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='disconnect', aliases=['dc'])
async def disconnect(ctx):
    """Déconnecter le bot du canal vocal"""
    player = bot.get_player(ctx)
    await player.stop()
    await player.disconnect()
    await ctx.send("👋 Déconnecté du canal vocal")

@bot.command(name='clear')
async def clear_queue(ctx):
    """Vider la queue sans arrêter la lecture actuelle"""
    player = bot.get_player(ctx)
    if player.queue:
        count = len(player.queue)
        player.queue.clear()
        await ctx.send(f"🗑️ Queue vidée ({count} chansons supprimées)")
    else:
        await ctx.send("📝 La queue est déjà vide")

@bot.command(name='remove')
async def remove_from_queue(ctx, position: int):
    """Retirer une chanson de la queue par position"""
    player = bot.get_player(ctx)
    
    if not player.queue:
        await ctx.send("📝 La queue est vide")
        return
    
    if position < 1 or position > len(player.queue):
        await ctx.send(f"❌ Position invalide. La queue contient {len(player.queue)} chansons.")
        return
    
    # Convertir en list pour accéder par index
    queue_list = list(player.queue)
    removed_song = queue_list.pop(position - 1)
    player.queue = deque(queue_list)
    
    await ctx.send(f"🗑️ Retiré de la queue: **{removed_song.title}**")

@bot.command(name='help', aliases=['h'])
async def help_command(ctx):
    """Afficher les commandes disponibles"""
    embed = discord.Embed(
        title="🎵 OpiozenMusic - Commandes",
        description="Bot de musique multi-sources Discord",
        color=discord.Color.blue()
    )
    
    basic_commands = [
        ("!play <recherche>", "Jouer une chanson (auto-détection source)"),
        ("!alternative <recherche>", "Rechercher dans sources alternatives"),
        ("!pause / !resume", "Contrôler la lecture"),
        ("!stop", "Arrêter et vider la queue"),
        ("!skip", "Passer à la chanson suivante"),
        ("!queue", "Afficher la queue de lecture"),
    ]
    
    advanced_commands = [
        ("!volume <0-100>", "Changer le volume"),
        ("!loop", "Répéter la chanson actuelle"),
        ("!loopqueue", "Répéter la queue"),
        ("!shuffle", "Mode lecture aléatoire"),
        ("!clear", "Vider la queue"),
        ("!remove <position>", "Retirer une chanson"),
    ]
    
    info_commands = [
        ("!nowplaying", "Informations chanson actuelle"),
        ("!sources", "Sources disponibles"),
        ("!disconnect", "Déconnecter le bot"),
    ]
    
    for name, desc in basic_commands:
        embed.add_field(name=name, value=desc, inline=False)
    
    embed.add_field(name="🎛️ **Commandes Avancées**", value="\u200b", inline=False)
    for name, desc in advanced_commands:
        embed.add_field(name=name, value=desc, inline=False)
    
    embed.add_field(name="ℹ️ **Informations**", value="\u200b", inline=False)
    for name, desc in info_commands:
        embed.add_field(name=name, value=desc, inline=False)
    
    embed.set_footer(text="Multi-sources: YouTube, SoundCloud, Bandcamp, Vimeo | Optimisé Raspberry Pi")
    await ctx.send(embed=embed)

# Gestion des erreurs
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("❌ Arguments manquants. Utilisez `!help` pour voir les commandes.")
    elif isinstance(error, commands.CommandNotFound):
        await ctx.send("❌ Commande introuvable. Utilisez `!help` pour voir les commandes disponibles.")
    elif isinstance(error, commands.BadArgument):
        await ctx.send("❌ Argument invalide. Vérifiez le format de la commande.")
    else:
        logger.error(f"Erreur de commande: {error}")
        await ctx.send(f"❌ Une erreur s'est produite: {str(error)}")

# Nettoyage périodique
@bot.event
async def on_voice_state_update(member, before, after):
    """Déconnecter le bot si il reste seul dans un canal"""
    if member == bot.user:
        return
    
    # Vérifier chaque serveur
    for guild_id, player in bot.players.items():
        if player.voice_client and player.voice_client.channel:
            # Compter les membres non-bot dans le canal
            members = [m for m in player.voice_client.channel.members if not m.bot]
            if len(members) == 0:
                # Attendre 5 minutes avant de se déconnecter
                await asyncio.sleep(300)
                # Vérifier à nouveau
                if player.voice_client and player.voice_client.channel:
                    members = [m for m in player.voice_client.channel.members if not m.bot]
                    if len(members) == 0:
                        await player.stop()
                        await player.disconnect()
                        try:
                            await player.channel.send("👋 Déconnexion automatique - canal vide")
                        except:
                            pass

if __name__ == "__main__":
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        logger.error("Token Discord manquant! Veuillez configurer DISCORD_TOKEN dans le fichier .env")
        exit(1)
    
    try:
        bot.run(token)
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du bot: {e}")
