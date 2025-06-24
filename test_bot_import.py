# -*- coding: utf-8 -*-
try:
    import music_bot
    print("✅ Import du bot réussi!")
    print("✅ Le bot est prêt à fonctionner!")
except ImportError as e:
    print(f"❌ Erreur d'import: {e}")
except Exception as e:
    print(f"❌ Erreur: {e}")
