/**
 * @param {String} text 需要复制的内容
 * @return {Boolean} 复制成功:true或者复制失败:false  执行完函数后，按ctrl + v试试
 */
export function copyText(text: string): boolean {
  const textareaC = document.createElement('textarea');
  textareaC.setAttribute('readonly', 'readonly'); //设置只读属性防止手机上弹出软键盘
  textareaC.value = text;
  document.body.appendChild(textareaC); //将textarea添加为body子元素
  textareaC.select();
  const res = document.execCommand('copy');
  document.body.removeChild(textareaC); //移除DOM元素
  console.log('复制成功');
  return res;
}

export function download(href: string) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function isNeedAutoDownload() {
  const uri = new URLSearchParams(location.search);
  return uri.get('autodownload') === 'true';
}

export async function getMagnetUrlFromNet(url: string) {
  try {
    const html = await (await fetch(url)).text()!;
    const hashId = html.match(/Config\['hash_id'\] = "(.*)"/)?.[1].trim();
    const announce = html.match(/Config\['announce'\] = "(.*)"/)?.[1].trim();
    return `magnet:?xt=urn:btih:${hashId}&tr=${announce}`;
  } catch (error) {
    console.error(error);
  }
  return '';
}

// export function autoDownload() {
//     if (
//         isNeedAutoDownload() &&
//         Config &&
//         Config['hash_id'] &&
//         Config['announce']
//     ) {
//         const magnetUrl = `magnet:?xt=urn:btih:${Config['hash_id']}&tr=${Config['announce']}`;
//         console.log(magnetUrl);
//         download(magnetUrl);
//         setTimeout(() => {
//             window.close();
//         }, 300);
//     }
// }
