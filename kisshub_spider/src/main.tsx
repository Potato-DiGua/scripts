import React from 'react';
import pure from './css/pure.module.css';
import styles from './css/index.module.css';
import { copyText, download, getMagnetUrlFromNet } from './utils';

function addExtraBtn() {
  const head = document.querySelector('#listTable > thead > tr')!;
  const th = (
    <th axis="string" className="l8 tableHeaderOver">
      动作
    </th>
  );
  head.appendChild(th);
  const trs = document.querySelectorAll('#data_list > tr');
  trs.forEach((tr) => {
    const href = tr.querySelector('td:nth-child(3) > a').href;
    const loading = (
      <span className={styles.loading} style={{ display: 'none' }}></span>
    );
    const downloadBtn = (
      <button
        style={{ marginRight: '5px' }}
        className={`${pure['pure-button']} ${pure['pure-button-primary']}`}
        onClick={async () => {
          loading.setAttribute('style', '');
          download(await getMagnetUrlFromNet(href));
          loading.setAttribute('style', 'display: none');
        }}
      >
        下载
        {loading}
      </button>
    );

    const td = (
      <td>
        {downloadBtn}
        <button
          className={`${pure['pure-button']} ${pure['pure-button-primary']}`}
          onClick={async () => {
            const magnetUrl = await getMagnetUrlFromNet(href);
            copyText(magnetUrl);
          }}
        >
          复制磁力链接
        </button>
      </td>
    );
    tr.appendChild(td);
  });
}

addExtraBtn();
// autoDownload();
