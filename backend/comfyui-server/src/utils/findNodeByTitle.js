export function findNodeByTitle(workflow, title) {
  for (const [nodeId, node] of Object.entries(workflow)) {
    if (node.class_type === title) {
      return nodeId;
    }
  }
  return undefined;
}