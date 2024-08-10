class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.passable = true;
        this.edges = [];
    }

    addEdge(node, weight) {
        this.edges.push({node, weight});
    }

    distanceTo(node) {
        return euclidean(this, node);
    }
}

class Surface {
    constructor(x, y) {
        this.surface = Array(x).fill().map(()=>Array(y).fill());
        
        for (let row = 0; row < this.surface.length; row++) {
            for (let col = 0; col < this.surface[row].length; col++) {
                this.surface[row][col] = new Node(row, col);
            }
        }

        for (let row = 0; row < this.surface.length; row++) {
            for (let col = 0; col < this.surface[row].length; col++) {
                for (let dx of [-1, 0, 1]) {
                    for (let dy of [-1, 0, 1]) {
                        if (!((dx == 0 && dy == 0)
                                || row + dx < 0
                                || row + dx >= this.surface.length
                                || col + dy < 0
                                || col + dy >= this.surface[row].length)) {

                            this.surface[row][col].addEdge(this.surface[row + dx][col + dy], (Math.abs(dx) + Math.abs(dy) > 1 ? 1.5 : 1));
                        }
                    }
                }
            }
        }
    }

    getNodeAt(row, col) {
        return this.surface[row][col];
    }

    randomizePassability(probability) {
        for (let row = 0; row < this.surface.length; row++) {
            for (let col = 0; col < this.surface[row].length; col++) {
                if (Math.random() < probability) {
                    this.surface[row][col].passable = false; // Make impassable
                }
            }
        }
    }
}

function taxicab(node1, node2) {
    return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}

function euclidean(node1, node2) {
    return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
}

export { Surface, Node, taxicab };