import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export const downloadImage = async (imageUrl) => {
    if(!imageUrl) return null;
    return new Promise((resolve,reject) => {
        try {
            // 检查是否是 base64 图片
            if (imageUrl.startsWith('data:image')) {
                // 从 base64 URL 中提取实际的 base64 数据
                const base64Data = imageUrl.split(',')[1];
                const timestamp = (new Date()).getTime();
                const tempFilePath = `${RNFS.CachesDirectoryPath}/image_${timestamp}.jpg`;

                // 将 base64 数据写入临时文件
                RNFS.writeFile(tempFilePath, base64Data, 'base64')
                    .then(() => {
                        // 保存到相册
                        return CameraRoll.saveToCameraRoll(tempFilePath);
                    })
                    .then(() => {
                        // 删除临时文件
                        RNFS.unlink(tempFilePath);
                        resolve({ statusCode: 200 });
                    })
                    .catch((err) => {
                        console.log("保存失败", err);
                        reject(err);
                    });
            } else {
                // 处理普通 URL
                let timestamp = (new Date()).getTime();
                let dirs = RNFS.ExternalDirectoryPath;
                const downloadDest = `${dirs}/image_${timestamp}.jpg`;

                const options = {
                    fromUrl: imageUrl,
                    toFile: downloadDest,
                    background: true,
                    begin: (res) => {
                        console.log("开始下载");
                    }
                };

                const ret = RNFS.downloadFile(options);
                ret.promise.then((res) => {
                    if (res.statusCode === 200) {
                        CameraRoll.saveToCameraRoll(downloadDest)
                            .then(() => {
                                console.log("保存成功");
                                resolve(res);
                            })
                            .catch((err) => {
                                console.log("保存到相册失败", err);
                                reject(err);
                            });
                    } else {
                        reject(new Error("下载失败"));
                    }
                }).catch((err) => {
                    console.log("下载失败", err);
                    reject(err);
                });
            }
        } catch(error) {
            reject(error);
        }
    });
}