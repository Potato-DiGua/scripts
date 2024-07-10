// import React from 'dom-chef';
import pure from './css/pure.module.css';
import styles from './css/index.module.css';
import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';
import { copyText, download, getMagnetUrlFromNet } from './utils';

function OptionBtn({ href }: { href: string }) {
  const [isLoading, setLoading] = createSignal(false);
  const [isMagnetLoading, setMagnetLoading] = createSignal(false);
  return (
    <td>
      <button
        style="margin-right:5px"
        className={[pure['pure-button'], pure['pure-button-primary']].join(' ')}
        onClick={async () => {
          setLoading(true);
          download(await getMagnetUrlFromNet(href));
          setLoading(false);
        }}
      >
        下载
        <span
          className={styles.loading}
          style={isLoading() ? {} : { display: 'none' }}
        ></span>
      </button>
      <button
        className={[pure['pure-button'], pure['pure-button-primary']].join(' ')}
        onClick={async () => {
          setMagnetLoading(true);
          const magnetUrl = await getMagnetUrlFromNet(href);
          copyText(magnetUrl);
          setMagnetLoading(false);
        }}
      >
        复制磁力链接
        <span
          className={styles.loading}
          style={isMagnetLoading() ? {} : { display: 'none' }}
        ></span>
      </button>
    </td>
  );
}

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
    render(() => <OptionBtn href={href} />, tr);
  });
}

addExtraBtn();
// autoDownload();
