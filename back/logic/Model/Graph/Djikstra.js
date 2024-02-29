const {Graph} = require("./Graph.js");
const {GraphNode} = require("./GraphNode.js");
const {GraphVertices} = require("./GraphVertices.js");
const {Wall} = require("../Objects/Wall.js");
const {Position} = require("../Objects/Position.js");
const {WallDictionary} = require("../Objects/WallDictionary.js");
const {PlayableSquareDictionary} = require("../Objects/PlayableSquareDictionary.js");
const {PlayableSquare} = require("../Objects/PlayableSquare.js");

class Djikstra {
    constructor() {}
    compute_djikstra(graph, startNode, endNode) {
        console.log("compute_djikstra");
        graph.nodes.forEach(node => {
            console.log("node position",node.position);
        });
        let distances = {};
        let prev = {};
        let pq = new PriorityQueue();

        graph.nodes.forEach(node => {
            distances[node.position] = Infinity;
            prev[node.position] = null;
            pq.enqueue(node, Infinity);
        });

        distances[startNode.position] = 0;
        pq.updatePriority(startNode, 0);

        while (!pq.isEmpty()) {
            let {element: currentNode} = pq.dequeue();

            // Si nous avons atteint le nœud de destination, arrêtons l'algorithme
            if (currentNode === endNode) break;
            let neighbors = currentNode.getNeighborhood();
            neighbors.forEach(neighbor => {
                let alt = distances[currentNode.position] + 1; // Suppose un poids de 1 pour chaque arête
                if (alt < distances[neighbor.position]) {
                    distances[neighbor.position] = alt;
                    prev[neighbor.position] = currentNode;
                    pq.updatePriority(neighbor, alt);
                }
            });
        }
        // Reconstruire le chemin le plus court de startNode à endNode
        let path = [];
        for (let at = endNode; at !== null; at = prev[at.position]) {
            path.push(at);
        }
        path.reverse();
        // Le chemin est construit à l'envers, donc nous le retournons
        // Retourner le chemin et la distance

        return {
            path: path,
            distance: distances[endNode.position]
        };
    }
}

class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        let contain = false;
        const queueElement = { element, priority };

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > queueElement.priority) {
                this.items.splice(i, 0, queueElement);
                contain = true;
                break;
            }
        }

        if (!contain) {
            this.items.push(queueElement);
        }
    }

    updatePriority(element, newPriority) {
        // Trouver l'élément dans la file d'attente
        let found = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].element === element) {
                // Element trouvé, retirer de la file d'attente
                this.items.splice(i, 1);
                found = true;
                break;
            }
        }

        // Si l'élément a été trouvé, l'ajouter à nouveau avec la nouvelle priorité
        if (found) {
            this.enqueue(element, newPriority);
        } else {
            //console.log('Element not found in priority queue.');
        }
    }

    dequeue() {
        if (this.isEmpty())
            return 'Underflow';
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    front() {
        if (this.isEmpty())
            return 'No elements in Queue';
        return this.items[0];
    }

    rear() {
        if (this.isEmpty())
            return 'No elements in Queue';
        return this.items[this.items.length - 1];
    }

    clear() {
        this.items = [];
    }

    size() {
        return this.items.length;
    }
}
module.exports = {Djikstra,PriorityQueue};
