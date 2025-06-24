# -*- coding: utf-8 -*-
"""
OpiozenMusic - Bot Discord de musique multi-plateformes
Support: YouTube, SoundCloud, Spotify (avec contournement des restrictions)
Auteur: Assistant IA
Version: 2.0 - Corrigée et optimisée
"""

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
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration yt-dlp avec support multi-plateformes
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
    'default_search': 'ytsearch',
    'source_address': '0.0.0.0',
    'extract_flat': False,
    'writethumbnail': False,
    'writeinfojson': False,
    # Contournement des restrictions YouTube
    'extractor_args': {
        'youtube': {
            'skip': ['hls', 'dash'],
            'player_skip': ['configs', 'webpage']
        },
        'soundcloud': {
            'lazy_playlist': True
        }
    },
    # Headers pour contourner la détection de bot
    'http_headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-us,en;q=0.5',
        'Accept-Encoding': 'gzip,deflate',
        'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
        'Connection': 'close'
    },
    # Support des cookies pour l'authentification
    'cookiefile': None,
    # Tentative d'authentification automatique
    'username': 'oauth2',
    'password': '',
}

ffmpeg_options = {
    'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
    'options': '-vn'
}

ytdl = yt_dlp.YoutubeDL(ytdl_format_options)

class YTDLSource(discord.PCMVolumeTransformer):
    """Source audio avec support multi-plateformes"""
    
    def __init__(self, source, *, data, volume=0.5):
        super().__init__(source, volume)
        self.data = data
        self.title = data.get('title', 'Titre inconnu')
        self.url = data.get('url', '')
        self.duration = data.get('duration', 0)
        self.thumbnail = data.get('thumbnail', '')
        self.uploader = data.get('uploader', '')

    @classmethod
    async def from_url(cls, url_or_query, *, loop=None, stream=False):
        """Créer une source audio depuis une URL ou une requête"""
        loop = loop or asyncio.get_event_loop()
        
        try:
            # Détecter la plateforme
            platform = detect_platform(url_or_query)
            logger.info(f"Plateforme détectée: {platform} pour {url_or_query}")
            
            # Traitement spécial pour Spotify
            if platform == 'spotify':
                try:
                    spotify_info = get_spotify_track_info(url_or_query)
                    # Rechercher sur YouTube avec les informations Spotify
                    search_query = f"ytsearch:{spotify_info['search_query']}"
                    return await cls._extract_from_query(search_query, loop, stream, spotify_info)
                except Exception as e:
                    logger.error(f"Erreur Spotify: {e}")
                    raise Exception(f"🎵 Erreur Spotify: {str(e)}")
            
            # Pour YouTube, SoundCloud et recherches
            elif platform in ['youtube', 'soundcloud']:
                return await cls._extract_from_query(url_or_query, loop, stream)
            
            # Pour les recherches textuelles
            else:
                search_query = f"ytsearch:{url_or_query}"
                return await cls._extract_from_query(search_query, loop, stream)
                
        except Exception as e:
            logger.error(f"Erreur dans from_url: {e}")
            raise e
    
    @classmethod
    async def _extract_from_query(cls, query, loop, stream, spotify_info=None):
        """Extraire l'audio depuis une requête/URL avec gestion d'erreurs robuste"""
        
        # Configuration alternative pour les problèmes YouTube
        alternative_options = ytdl_format_options.copy()
        alternative_options.update({
            'format': 'worst[abr>0]/worst/best[height<=480]',
            'extractaudio': True,
            'audioformat': 'mp3',
            'outtmpl': '%(extractor)s-%(id)s-%(title)s.%(ext)s',
            'restrictfilenames': True,
            'noplaylist': True,
            'ignoreerrors': True,
            'quiet': True,
            'no_warnings': True,
            'cookiefile': None,
            'extract_flat': False,
            'writethumbnail': False,
            'writeinfojson': False,
            'age_limit': None,
            'extractor_args': {
                'youtube': {
                    'skip': ['dash', 'hls'],
                    'player_skip': ['js', 'configs', 'webpage'],
                    'comment_sort': ['top'],
                    'max_comments': [0]
                },
                'soundcloud': {
                    'lazy_playlist': True
                }
            }
        })
        
        # Configuration spéciale pour SoundCloud
        soundcloud_options = ytdl_format_options.copy()
        soundcloud_options.update({
            'format': 'best',
            'noplaylist': True,
            'extract_flat': False,
        })
        
        # Tentatives multiples avec différentes configurations
        attempts = [
            (ytdl, "Configuration standard"),
            (yt_dlp.YoutubeDL(alternative_options), "Configuration alternative"),
        ]
        
        # Ajouter la configuration SoundCloud si nécessaire
        if query and 'soundcloud.com' in query.lower():
            attempts.insert(1, (yt_dlp.YoutubeDL(soundcloud_options), "Configuration SoundCloud"))
        
        last_error = None
        
        for ytdl_instance, config_name in attempts:
            try:
                logger.info(f"Tentative d'extraction avec {config_name}")
                data = await loop.run_in_executor(None, lambda: ytdl_instance.extract_info(query, download=not stream))
                
                # Vérifier si data est None
                if data is None:
                    logger.warning(f"Aucune donnée extraite avec {config_name}")
                    continue
                
                # Gérer les playlists
                if isinstance(data, dict) and 'entries' in data:
                    # Vérifier si la liste entries existe et n'est pas vide
                    if not data.get('entries'):
                        logger.warning(f"Playlist vide avec {config_name}")
                        continue
                    
                    # Prendre la première entrée valide
                    for entry in data['entries']:
                        if entry is not None and isinstance(entry, dict):
                            data = entry
                            break
                    else:
                        # Aucune entrée valide trouvée
                        logger.warning(f"Aucune entrée valide dans la playlist avec {config_name}")
                        continue
                
                # Vérifier que les données sont valides
                if not isinstance(data, dict):
                    logger.warning(f"Type de données invalide avec {config_name}")
                    continue
                    
                if not data.get('url'):
                    logger.warning(f"URL manquante dans les données avec {config_name}")
                    continue
                
                # Ajouter les informations Spotify si disponibles
                if spotify_info:
                    data['spotify_info'] = spotify_info
                    data['platform'] = 'spotify'
                
                # Créer la source audio
                try:
                    filename = data['url'] if stream else ytdl_instance.prepare_filename(data)
                    title = data.get('title', 'Titre inconnu')
                    logger.info(f"Extraction réussie avec {config_name}: {title}")
                    return cls(discord.FFmpegPCMAudio(filename, **ffmpeg_options), data=data)
                except Exception as audio_error:
                    logger.warning(f"Erreur lors de la création de la source audio: {audio_error}")
                    continue
                    
            except Exception as e:
                last_error = e
                logger.warning(f"Échec avec {config_name}: {str(e)}")
                continue
        
        # Si toutes les tentatives échouent
        error_msg = f"Impossible d'extraire l'audio de {query}"
        if last_error:
            error_str = str(last_error)
            if "Sign in to confirm you're not a bot" in error_str:
                error_msg = "🤖 YouTube détecte une activité de bot. Essayez avec un autre lien ou réessayez plus tard."
            elif any(msg in error_str for msg in ["Video unavailable", "not available", "private video"]):
                error_msg = "❌ Cette vidéo n'est pas disponible (privée, supprimée ou restreinte géographiquement)."
            elif "This video is not available" in error_str:
                error_msg = "❌ Cette vidéo n'est pas accessible dans votre région."
            elif query and "soundcloud" in query.lower() and "not found" in error_str.lower():
                error_msg = "❌ Cette piste SoundCloud n'est pas disponible ou a été supprimée."
            elif "argument of type 'NoneType'" in error_str:
                error_msg = "❌ Impossible d'extraire les informations. Le contenu pourrait être bloqué ou inaccessible."
            elif "No video formats found" in error_str:
                error_msg = "❌ Aucun format audio disponible. Le contenu pourrait être restreint ou géo-bloqué."
            else:
                error_msg = f"❌ Erreur lors de l'extraction: {error_str}"
                
        # Ajouter des suggestions pour certains types d'erreurs
        if "bot" in error_msg.lower() or "unavailable" in error_msg.lower():
            error_msg += "\n💡 Suggestions:\n• Essayez avec un autre lien\n• Utilisez une recherche par titre\n• Essayez SoundCloud ou Spotify"
        
        logger.error(error_msg)
        raise Exception(error_msg)

class MusicPlayer:
    """Lecteur de musique pour un serveur Discord"""
    
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
        try:
            if self.voice_client is None:
                self.voice_client = await voice_channel.connect()
            else:
                await self.voice_client.move_to(voice_channel)
        except Exception as e:
            logger.error(f"Erreur de connexion au canal vocal: {e}")
            raise e
    
    async def disconnect(self):
        """Se déconnecter du canal vocal"""
        try:
            if self.voice_client:
                await self.voice_client.disconnect()
                self.voice_client = None
        except Exception as e:
            logger.error(f"Erreur de déconnexion: {e}")
    
    def add_to_queue(self, source):
        """Ajouter une source à la queue"""
        if source:
            self.queue.append(source)
    
    async def play_next(self):
        """Jouer la prochaine chanson"""
        try:
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
            if hasattr(source, 'volume'):
                source.volume = self.volume
            
            # Jouer la chanson
            def after_playing(error):
                if error:
                    logger.error(f"Erreur de lecture: {error}")
                # Programmer la prochaine chanson
                future = asyncio.run_coroutine_threadsafe(self.play_next(), self.bot.loop)
                try:
                    future.result()
                except Exception as e:
                    logger.error(f"Erreur lors de la programmation de la prochaine chanson: {e}")
            
            self.voice_client.play(source, after=after_playing)
            
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
            if source.duration and source.duration > 0:
                minutes, seconds = divmod(source.duration, 60)
                embed.add_field(name="Durée", value=f"{int(minutes):02d}:{int(seconds):02d}", inline=True)
            
            await self.channel.send(embed=embed)
            
        except Exception as e:
            logger.error(f"Erreur dans play_next: {e}")
            self.is_playing = False
    
    async def pause(self):
        """Mettre en pause"""
        try:
            if self.voice_client and self.voice_client.is_playing():
                self.voice_client.pause()
                self.is_paused = True
        except Exception as e:
            logger.error(f"Erreur lors de la pause: {e}")
    
    async def resume(self):
        """Reprendre la lecture"""
        try:
            if self.voice_client and self.voice_client.is_paused():
                self.voice_client.resume()
                self.is_paused = False
        except Exception as e:
            logger.error(f"Erreur lors de la reprise: {e}")
    
    async def stop(self):
        """Arrêter la lecture"""
        try:
            if self.voice_client:
                self.voice_client.stop()
            self.queue.clear()
            self.current = None
            self.is_playing = False
            self.is_paused = False
        except Exception as e:
            logger.error(f"Erreur lors de l'arrêt: {e}")
    
    async def skip(self):
        """Passer à la chanson suivante"""
        try:
            if self.voice_client and self.voice_client.is_playing():
                self.voice_client.stop()
        except Exception as e:
            logger.error(f"Erreur lors du skip: {e}")

class MusicBot(commands.Bot):
    """Bot Discord de musique"""
    
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
        try:
            await self.change_presence(
                activity=discord.Activity(
                    type=discord.ActivityType.listening,
                    name=os.getenv('BOT_STATUS', 'Écoute de la musique 🎵')
                )
            )
        except Exception as e:
            logger.error(f"Erreur lors du changement de statut: {e}")
    
    def get_player(self, ctx):
        """Obtenir le player pour un serveur"""
        if ctx.guild.id not in self.players:
            self.players[ctx.guild.id] = MusicPlayer(ctx)
        return self.players[ctx.guild.id]

bot = MusicBot()

@bot.command(name='play', aliases=['p'])
async def play(ctx, *, query):
    """Jouer une chanson depuis YouTube/SoundCloud/Spotify"""
    if not ctx.author.voice:
        await ctx.send("❌ Vous devez être dans un canal vocal pour utiliser cette commande!")
        return
        
    if not query or not query.strip():
        await ctx.send("❌ Veuillez spécifier une chanson à jouer!")
        return
    
    voice_channel = ctx.author.voice.channel
    player = bot.get_player(ctx)
    
    # Se connecter au canal vocal
    try:
        await player.connect(voice_channel)
    except Exception as e:
        await ctx.send(f"❌ Impossible de se connecter au canal vocal: {str(e)}")
        return
    
    # Message de chargement
    loading_msg = await ctx.send("🔍 Recherche en cours...")
    
    try:
        # Extraire les informations de la vidéo
        source = await YTDLSource.from_url(query.strip(), loop=bot.loop, stream=True)
        
        # Détecter la plateforme pour l'affichage
        platform = detect_platform(query)
        platform_emoji = {
            'youtube': '🎥',
            'soundcloud': '🎵',
            'spotify': '🎶',
            'search': '🔍'
        }.get(platform, '🎵')
        
        if player.is_playing:
            # Ajouter à la queue
            player.add_to_queue(source)
            embed = discord.Embed(
                title="📝 Ajouté à la queue",
                description=f"{platform_emoji} **{source.title}**",
                color=discord.Color.green()
            )
            embed.add_field(name="Position", value=len(player.queue), inline=True)
            if source.duration and source.duration > 0:
                embed.add_field(name="Durée", value=f"{source.duration // 60}:{source.duration % 60:02d}", inline=True)
            
            # Afficher la plateforme source
            if hasattr(source.data, 'spotify_info'):
                embed.add_field(name="Source", value="Spotify → YouTube", inline=True)
            elif platform == 'soundcloud':
                embed.add_field(name="Source", value="SoundCloud", inline=True)
            elif platform == 'youtube':
                embed.add_field(name="Source", value="YouTube", inline=True)
            
            await loading_msg.edit(content="", embed=embed)
        else:
            # Jouer immédiatement
            player.add_to_queue(source)
            await player.play_next()
            await loading_msg.delete()
    
    except Exception as e:
        error_msg = str(e)
        
        # Messages d'erreur personnalisés
        if "🎵 Erreur Spotify" in error_msg:
            embed = discord.Embed(
                title="🎶 Erreur Spotify",
                description="Problème avec le lien Spotify.",
                color=discord.Color.red()
            )
            embed.add_field(
                name="💡 Solutions",
                value="• Vérifiez que le lien Spotify est correct\n• Configurez les credentials Spotify dans .env\n• Essayez de copier le titre et l'artiste manuellement",
                inline=False
            )
            embed.add_field(name="Détails", value=error_msg[:1000], inline=False)
            await loading_msg.edit(content="", embed=embed)
        elif "Sign in to confirm you're not a bot" in error_msg:
            embed = discord.Embed(
                title="🤖 Restriction YouTube",
                description="YouTube a détecté une activité de bot. Voici quelques solutions:",
                color=discord.Color.orange()  
            )
            embed.add_field(
                name="💡 Solutions",
                value="• Essayez avec un autre lien\n• Réessayez dans quelques minutes\n• Utilisez un lien plus court\n• Essayez avec SoundCloud",
                inline=False
            )
            embed.add_field(
                name="🔄 Mise à jour",
                value="Tapez `!update` pour mettre à jour yt-dlp",
                inline=False
            )
            await loading_msg.edit(content="", embed=embed)
        elif "SoundCloud" in error_msg:
            embed = discord.Embed(
                title="🎵 Erreur SoundCloud",
                description="Problème avec le lien SoundCloud.",
                color=discord.Color.orange()
            )
            embed.add_field(
                name="Causes possibles",
                value="• Piste privée ou supprimée\n• Limitation géographique\n• Problème de réseau",
                inline=False
            )
            await loading_msg.edit(content="", embed=embed)
        elif "Video unavailable" in error_msg or "not available" in error_msg:
            embed = discord.Embed(
                title="❌ Contenu indisponible",
                description="Ce contenu n'est pas accessible.",
                color=discord.Color.red()
            )
            embed.add_field(
                name="Causes possibles",
                value="• Contenu privé ou supprimé\n• Restriction géographique\n• Problème de droits d'auteur",
                inline=False
            )
            await loading_msg.edit(content="", embed=embed)
        else:
            embed = discord.Embed(
                title="❌ Erreur de lecture",
                description="Impossible de lire ce contenu.",
                color=discord.Color.red()
            )
            embed.add_field(name="Détails", value=f"```{error_msg[:1000]}```", inline=False)
            await loading_msg.edit(content="", embed=embed)
        
        logger.error(f"Erreur lors de la lecture de {query}: {error_msg}")

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
    if player.current and hasattr(player.current, 'volume'):
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
    if source.duration and source.duration > 0:
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
        description="Bot de musique multi-plateformes pour Discord",
        color=discord.Color.blue()
    )
    
    # Commandes principales
    embed.add_field(
        name="🎵 Lecture",
        value="• `!play <lien/recherche>` - Jouer depuis YouTube/SoundCloud/Spotify\n• `!pause` - Mettre en pause\n• `!resume` - Reprendre\n• `!stop` - Arrêter et vider la queue\n• `!skip` - Passer à la suivante",
        inline=False
    )
    
    embed.add_field(
        name="📝 Queue & Info",
        value="• `!queue` - Afficher la file d'attente\n• `!nowplaying` - Chanson actuelle\n• `!volume <0-100>` - Régler le volume",
        inline=False
    )
    
    embed.add_field(
        name="🔄 Répétition",
        value="• `!loop` - Répéter la chanson actuelle\n• `!loopqueue` - Répéter toute la queue",
        inline=False
    )
    
    embed.add_field(
        name="🔧 Utilitaires",
        value="• `!platforms` - Plateformes supportées\n• `!update` - Mettre à jour yt-dlp (admin)\n• `!disconnect` - Déconnecter le bot",
        inline=False
    )
    
    embed.add_field(
        name="🎯 Plateformes supportées",
        value="🎥 YouTube • 🎵 SoundCloud • 🎶 Spotify • 🔍 Recherche textuelle",
        inline=False
    )
    
    embed.set_footer(text="Support multi-plateformes | Aucune API externe requise (sauf Spotify optionnel)")
    await ctx.send(embed=embed)

@bot.command(name='update')
async def update_ytdlp(ctx):
    """Mettre à jour yt-dlp pour résoudre les problèmes YouTube"""
    # Vérifier si l'utilisateur est administrateur
    if not ctx.author.guild_permissions.administrator:
        await ctx.send("❌ Seuls les administrateurs peuvent utiliser cette commande.")
        return
    
    loading_msg = await ctx.send("🔄 Mise à jour de yt-dlp en cours...")
    
    try:
        import subprocess
        import sys
        
        # Mise à jour de yt-dlp
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '--upgrade', 'yt-dlp'
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            # Redémarrer le module yt-dlp
            import importlib
            import yt_dlp
            importlib.reload(yt_dlp)
            
            # Recréer l'instance ytdl avec les nouvelles configs
            global ytdl
            ytdl = yt_dlp.YoutubeDL(ytdl_format_options)
            
            embed = discord.Embed(
                title="✅ Mise à jour réussie",
                description="yt-dlp a été mis à jour avec succès",
                color=discord.Color.green()
            )
            embed.add_field(
                name="🔄 Redémarrage recommandé",
                value="Pour une meilleure stabilité, redémarrez le bot",
                inline=False
            )
            await loading_msg.edit(content="", embed=embed)
        else:
            await loading_msg.edit(content=f"❌ Échec de la mise à jour: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        await loading_msg.edit(content="⏱️ Mise à jour timeout - Réessayez plus tard")
    except Exception as e:
        await loading_msg.edit(content=f"❌ Erreur lors de la mise à jour: {str(e)}")

@bot.command(name='platforms', aliases=['sources'])
async def supported_platforms(ctx):
    """Afficher les plateformes supportées"""
    embed = discord.Embed(
        title="🎵 Plateformes Supportées",
        description="OpiozenMusic supporte plusieurs plateformes de musique",
        color=discord.Color.blue()
    )
    
    embed.add_field(
        name="🎥 YouTube",
        value="• Liens directs\n• Recherche textuelle\n• Playlistes (premier élément)",
        inline=True
    )
    
    embed.add_field(
        name="🎵 SoundCloud",
        value="• Liens directs SoundCloud\n• Pistes publiques\n• Support natif",
        inline=True
    )
    
    embed.add_field(
        name="🎶 Spotify",
        value="• Liens de pistes Spotify\n• Conversion vers YouTube\n• Nécessite configuration",
        inline=True
    )
    
    embed.add_field(
        name="🔍 Recherche",
        value="• Tapez simplement le nom\n• Recherche automatique sur YouTube\n• Format: `artiste - titre`",
        inline=False
    )
    
    embed.add_field(
        name="⚙️ Configuration Spotify (Optionnelle)",
        value="Ajoutez dans votre `.env`:\n```\nSPOTIFY_CLIENT_ID=votre_id\nSPOTIFY_CLIENT_SECRET=votre_secret\n```",
        inline=False
    )
    
    embed.add_field(
        name="📖 Exemples d'utilisation",
        value="• `!play https://youtube.com/watch?v=...`\n• `!play https://soundcloud.com/...`\n• `!play https://open.spotify.com/track/...`\n• `!play Imagine Dragons Believer`",
        inline=False
    )
    
    await ctx.send(embed=embed)

# Fonction utilitaire pour détecter le type de plateforme
def detect_platform(url_or_query):
    """Détecter la plateforme de musique depuis l'URL ou la requête"""
    if not url_or_query:
        return 'search'
        
    url_lower = url_or_query.lower()
    
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'youtube'
    elif 'soundcloud.com' in url_lower:
        return 'soundcloud'
    elif 'spotify.com' in url_lower or 'open.spotify.com' in url_lower:
        return 'spotify'
    else:
        # Si c'est juste du texte, c'est probablement une recherche
        return 'search'

# Configuration Spotify (optionnelle)
def setup_spotify():
    """Configuration du client Spotify si les credentials sont disponibles"""
    try:
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if client_id and client_secret:
            client_credentials_manager = SpotifyClientCredentials(
                client_id=client_id, 
                client_secret=client_secret
            )
            return spotipy.Spotify(client_credentials_manager=client_credentials_manager)
        return None
    except Exception as e:
        logger.warning(f"Impossible d'initialiser Spotify: {e}")
        return None

# Initialiser le client Spotify
spotify_client = setup_spotify()

def get_spotify_track_info(spotify_url):
    """Récupérer les informations d'une piste Spotify"""
    if not spotify_client:
        raise Exception("Client Spotify non configuré. Ajoutez SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET à votre .env")
    
    if not spotify_url:
        raise Exception("URL Spotify manquante")
    
    # Extraire l'ID de la piste depuis l'URL
    track_id_match = re.search(r'track/([a-zA-Z0-9]+)', spotify_url)
    if not track_id_match:
        raise Exception("URL Spotify invalide")
    
    track_id = track_id_match.group(1)
    
    try:
        track = spotify_client.track(track_id)
        if not track:
            raise Exception("Piste Spotify introuvable")
            
        artist_name = track['artists'][0]['name'] if track.get('artists') else 'Artiste inconnu'
        track_name = track.get('name', 'Titre inconnu')
        duration_ms = track.get('duration_ms', 0)
        
        # Créer une requête de recherche pour YouTube
        search_query = f"{artist_name} - {track_name}"
        
        return {
            'search_query': search_query,
            'title': f"{artist_name} - {track_name}",
            'artist': artist_name,
            'duration': duration_ms // 1000 if duration_ms else 0,
            'platform': 'spotify'
        }
    except Exception as e:
        raise Exception(f"Erreur lors de la récupération des informations Spotify: {e}")

# Gestion des erreurs
@bot.event
async def on_command_error(ctx, error):
    """Gestion globale des erreurs de commandes"""
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("❌ Arguments manquants. Utilisez `!help` pour voir les commandes.")
    elif isinstance(error, commands.CommandNotFound):
        await ctx.send("❌ Commande introuvable. Utilisez `!help` pour voir les commandes disponibles.")
    elif isinstance(error, commands.BadArgument):
        await ctx.send("❌ Argument invalide. Vérifiez la syntaxe avec `!help`.")
    elif isinstance(error, commands.BotMissingPermissions):
        await ctx.send("❌ Le bot n'a pas les permissions nécessaires.")
    elif isinstance(error, commands.MissingPermissions):
        await ctx.send("❌ Vous n'avez pas les permissions nécessaires.")
    else:
        logger.error(f"Erreur de commande non gérée: {error}")
        await ctx.send(f"❌ Une erreur s'est produite: {str(error)[:500]}")

if __name__ == "__main__":
    # Vérification du token Discord
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        logger.error("Token Discord manquant! Veuillez configurer DISCORD_TOKEN dans le fichier .env")
        print("❌ ERREUR: Token Discord manquant!")
        print("Créez un fichier .env avec: DISCORD_TOKEN=votre_token_ici")
        exit(1)
    
    try:
        logger.info("Démarrage du bot OpiozenMusic...")
        bot.run(token)
    except discord.LoginFailure:
        logger.error("Token Discord invalide!")
        print("❌ ERREUR: Token Discord invalide!")
    except Exception as e:
        logger.error(f"Erreur lors du démarrage du bot: {e}")
        print(f"❌ ERREUR: {e}")
