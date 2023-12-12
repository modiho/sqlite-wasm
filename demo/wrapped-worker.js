import { sqlite3Worker1Promiser } from '../index.mjs';

(async () => {
  const container = document.querySelector('.worker-promiser');

  const logHtml = function (cssClass, ...args) {
    const div = document.createElement('div');
    if (cssClass) div.classList.add(cssClass);
    div.append(document.createTextNode(args.join(' ')));
    container.append(div);
  };

  try {
    logHtml('', 'Loading and initializing SQLite3 module...');

    const promiser = await new Promise((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => {
          resolve(_promiser);
        },
      });
    });

    logHtml('', 'Done initializing. Running demo...');

    let response;
    let response2;

    response = await promiser('config-get', {});
    logHtml('', 'Running SQLite3 version', response.result.version.libVersion);

    response = await promiser('open', {
      filename: 'file:worker-promiser.sqlite3?vfs=opfs',
    });
    const { dbId } = response;
    logHtml(
      '',
      'Created persisted database at',
      response.result.filename.replace(/^file:(.*?)\?vfs=opfs/, '$1'),
    );

    response2 = await promiser('open', {
      filename: 'file:worker-promiser-2.sqlite3?vfs=opfs',
    });
    const { dbId: dbId2 } = response2;
    logHtml(
      '',
      'Created another persisted database at',
      response2.result.filename.replace(/^file:(.*?)\?vfs=opfs/, '$1'),
    );

    logHtml('', 'First dbId:', dbId);
    logHtml('', 'Second dbId:', dbId2);
    logHtml('', 'These should be different!');

    await promiser('close', { dbId });
    await promiser('close', { dbId: dbId2 });
  } catch (err) {
    if (!(err instanceof Error)) {
      err = new Error(err.result.message);
    }
    console.error(err.name, err.message);
  }
})();
