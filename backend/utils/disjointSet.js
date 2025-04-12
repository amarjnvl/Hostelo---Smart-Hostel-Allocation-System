class DisjointSet {
  constructor(n) {
    this.size = Array(n + 1).fill(1);
    this.parent = Array(n + 1)
      .fill(0)
      .map((_, i) => i);
  }

  findUpar(node) {
    if (node === this.parent[node]) return node;
    return (this.parent[node] = this.findUpar(this.parent[node]));
  }

  unionBySize(u, v) {
    let ultU = this.findUpar(u);
    let ultV = this.findUpar(v);

    if (ultU === ultV) return;

    if (this.size[ultU] < this.size[ultV]) {
      this.parent[ultU] = ultV;
      this.size[ultV] += this.size[ultU];
    } else {
      this.parent[ultV] = ultU;
      this.size[ultU] += this.size[ultV];
    }
  }
}

module.exports = DisjointSet;
