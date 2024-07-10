import pure from './css/pure.module.css';
import styles from './css/index.module.css';
import { defineComponent } from './vue-lit';
import { reactive } from '@vue/reactivity';
import { html, render } from 'lit-html';
import { copyText, download, getMagnetUrlFromNet } from './utils';

defineComponent(
  'quick-download',
  ['href'],
  (props: { href: string }, { root }) => {
    const state = reactive({
      loading: false,
    });

    const onDownloadClick = async () => {
      try {
        state.loading = true;
        download(await getMagnetUrlFromNet(props.href));
      } finally {
        state.loading = false;
      }
    };

    const onCopyClick = async () => {
      const magnetUrl = await getMagnetUrlFromNet(props.href);
      copyText(magnetUrl);
    };

    return () => html`
      <style>
        ${pure}${styles}
      </style>
      <td>
        <button
          style="marginRight: '5px'"
          class="pure-button pure-button-primary"
          @click=${onDownloadClick}
        >
          下载
          <span
            class="loading"
            style=${state.loading ? '' : 'display: none'}
          ></span>
        </button>
        <button class="pure-button pure-button-primary" @click=${onCopyClick}>
          复制磁力链接
        </button>
      </td>
    `;
  },
);

function addExtraBtn() {
  const head = document.querySelector('#listTable > thead > tr')!;
  render(html`<th axis="string" class="l8 tableHeaderOver">动作</th>`, head);
  const trs = document.querySelectorAll('#data_list > tr');
  trs.forEach((tr) => {
    const href = tr.querySelector('td:nth-child(3) > a').href;

    render(html`<td><quick-download href=${href}></quick-download></td>`, tr);
  });
}

addExtraBtn();
// autoDownload();
