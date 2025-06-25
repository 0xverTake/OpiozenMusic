// Simple test for the getNode method

// Create a mock Shoukaku instance with a nodes Map
const mockShoukaku = {
  nodes: new Map()
};

// Add a mock node to the Map
mockShoukaku.nodes.set('Main Node', {
  name: 'Main Node',
  state: 1 // Connected state
});

// Define the getNode function from our fixed code
function getNode() {
  try {
    // Get the first available node using the nodes Map
    const nodes = Array.from(this.shoukaku.nodes.values());
    const availableNode = nodes.find(node => node.state === 1) || nodes[0];
    
    if (!availableNode) {
      console.log("❌ Error: No available nodes found in the nodes Map");
      throw new Error("No available nodes");
    }
    
    return availableNode;
  } catch (error) {
    console.log(`❌ Error retrieving node: ${error.message}`);
    throw error;
  }
}

// Create a test context with the mock Shoukaku
const testContext = {
  shoukaku: mockShoukaku
};

// Bind the getNode function to our test context
const boundGetNode = getNode.bind(testContext);

// Test the function
console.log('Testing getNode method...');
try {
  const node = boundGetNode();
  console.log('✅ getNode successful:', node.name);
  console.log('\n✅ The fix should resolve the "this.shoukaku.getNode is not a function" error.');
} catch (error) {
  console.error('❌ getNode failed:', error.message);
  console.log('\n❌ The fix did not work. Further debugging may be needed.');
}
