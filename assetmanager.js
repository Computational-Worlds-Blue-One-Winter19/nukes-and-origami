class AssetManager {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
  }

  queueDownload(path) {
    this.downloadQueue.push(path);
  }

  isDone() {
    return this.downloadQueue.length === this.successCount + this.errorCount;
  }

  downloadAll(callback) {
    for (let i = 0; i < this.downloadQueue.length; i += 1) {
      const that = this;
      const img = new Image();

      const path = this.downloadQueue[i];

      img.addEventListener('load', () => {
        that.successCount += 1;
        if (that.isDone()) callback();
      });

      img.addEventListener('error', function eventListener() {
        console.log(`Error loading ${this.src}`);
        that.errorCount += 1;
        if (that.isDone()) callback();
      });

      img.src = path;
      this.cache[path] = img;
    }
  }

  getAsset(path) {
    return this.cache[path];
  }
}
