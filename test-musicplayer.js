const { Shoukaku, Connectors } = require('shoukaku');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a mock client
const mockClient = {
  user: { id: 'mock-user-id' },
  once: (event, callback) => {
    if (event === 'ready') {
      // Simulate ready event
      setTimeout(callback, 100);
    }
  },
  on: (event, callback) => {
    // Mock the on method
    return mockClient;
  },
  channels: {
    cache: {
      get: () => null
    }
  },
  guilds: {
    cache: new Map()
  }
};

// Mock the Shoukaku class to avoid actual connection
class MockShoukaku {
  constructor() {
    this.nodes = new Map();
    // Add a mock node
    this.nodes.set('Main Node', {
      name: 'Main Node',
      state: 1, // Connected state
      rest: {
        resolve: async () => {
          return {
            loadType: 'track',
            data: {
              encoded: 'mock-track-encoded',
              info: {
                title: 'Mock Track',
                uri: 'https://example.com/track',
                identifier: 'mock-id',
                length: 180000
              }
            }
          };
        }
      },
      joinChannel: async () => {
        return {
          connection: {
            disconnect: () => {}
          },
          on: () => {},
          playTrack: async () => {},
          stopTrack: () => {},
          setPaused: () => {}
        };
      }
    });
  }

  on(event, callback) {
    if (event === 'ready') {
      // Simulate ready event for the node
      callback('Main Node');
    }
    return this;
  }
}

// Import the MusicPlayer class
const MusicPlayerClass = require('./utils/musicPlayerLavalink');

// Override the Shoukaku class in the MusicPlayer
class TestMusicPlayer extends MusicPlayerClass {
  constructor(client) {
    super(client);
    // Replace the shoukaku instance with our mock
    this.shoukaku = new MockShoukaku();
  }
}

// Create an instance of the MusicPlayer
const musicPlayer = new TestMusicPlayer(mockClient);

// Test the getNode method
async function testGetNode() {
  console.log('Testing getNode method...');
  try {
    const node = musicPlayer.getNode();
    console.log('✅ getNode successful:', node.name);
    return true;
  } catch (error) {
    console.error('❌ getNode failed:', error.message);
    return false;
  }
}

// Test adding a song
async function testAddSong() {
  console.log('\nTesting addSong method...');
  try {
    // Create a mock interaction
    const mockInteraction = {
      guild: { id: 'mock-guild-id' },
      channel: { id: 'mock-channel-id' },
      user: { tag: 'MockUser#1234' },
      member: {
        voice: { channel: { id: 'mock-voice-channel-id', guild: { id: 'mock-guild-id', voiceAdapterCreator: {} } } }
      },
      options: {
        getString: () => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    };

    // Mock the connect method to avoid actual connection
    musicPlayer.connect = async () => {
      return musicPlayer.shoukaku.nodes.get('Main Node');
    };

    const result = await musicPlayer.addSong(mockInteraction, 'test query');
    console.log('✅ addSong successful:', result.songInfo.title);
    return true;
  } catch (error) {
    console.error('❌ addSong failed:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting MusicPlayer tests...\n');
  
  const getNodeSuccess = await testGetNode();
  const addSongSuccess = await testAddSong();
  
  console.log('\nTest Results:');
  console.log(`getNode: ${getNodeSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`addSong: ${addSongSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (getNodeSuccess && addSongSuccess) {
    console.log('\n✅ All tests passed! The fix should resolve the "this.shoukaku.getNode is not a function" error.');
  } else {
    console.log('\n❌ Some tests failed. Further debugging may be needed.');
  }
}

// Run the tests
runTests();
