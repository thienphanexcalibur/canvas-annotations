export const waitImageLoad = async (imageNode) => {
  if (imageNode.nodeName === 'IMG') {
    return new Promise((resolve, reject) => {
      imageNode.addEventListener('load', () => {
        resolve(true);
      });
      imageNode.addEventListener('error', (e) => {
        reject(e);
      });
    });
  }
};
