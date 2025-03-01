import firebase from 'firebase/app';
export default class FilesApi {
  constructor(private storage: firebase.storage.Storage) {}

  async upload(file: File, path: string, progressHandler?: (progress: number) => void) {
    return new Promise<boolean>(async (resolve, reject) => {
      const ref = this.storage.ref().child(path);
      const task = ref.put(file);
      task.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressHandler) progressHandler(progress);
        },
        (error) => {
          reject(error);
        },
        () => {
          resolve(true);
        }
      );
    });
  }

  /*sleepFunction(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getDownloadUrlWithLoop(ref: any, times: number, delay: number) {
    return new Promise(async (resolve, reject) => {
      let n = 0;
      let success = false;
      const getUrl = async () => {
        await this.sleepFunction(delay);
        await ref
          .getDownloadURL()
          .then((res: string) => {
            success = true;
            resolve(res);
          })
          .catch(() => null);
      };
      do {
        await getUrl();
        n++;
        if (n === times) {
          reject(null);
        }
      } while (success === false && n < times + 1);
    });
  }

  async getDownloadURL(path: string): Promise<string | null> {
    const ref = this.storage.ref().child(path);
    const uri = await this.getDownloadUrlWithLoop(ref, 5, 1000);
    return uri as string | null;
  }*/

  async getDownloadURL(path: string) {
    const ref = this.storage.ref().child(path);
    const uri = await ref
      .getDownloadURL()
      .then((res: string | null) => res)
      .catch(() => null);
    return uri;
  }
}
