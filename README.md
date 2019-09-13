<h1 align="center">QWebChannel bridge</h1>

This project is used to describe how to integrate `QWebChannel` with `Vue plugin`.

[中文指南](https://set.sh/post/190728-intergrate-qwebchannel)

## Prerequisites

`Qt` side should provide a Object named `context` which include all information shared with `JS` side.

1. A `Cpp` function named `emitEmbeddedPageLoad`

   ```cpp
   class WebBridge: public QObject {
     Q_OBJECT
     public slots:
     void emitEmbeddedPageLoad() {
         QMessageBox::information(NULL,"emitEmbeddedPageLoad","I'm called by client JS!");
     }
   };

   WebBridge *webBridge = new WebBridge();
   QWebChannel *channel = new QWebChannel(this);
   channel->registerObject('context', webBridge);
   view->page()->setWebChannel(channel);
   ```

1. In `JS` side, you should provide a init function when `QWebChannel` initialized.

   ```ts
   new QWebChannel(window.qt.webChannelTransport, function(channel) {
     const published = channel.objects.context
     Vue.prototype.$_bridge = published

     // This function calling will notify Qt server asynchronously
     published.emitEmbeddedPageLoad('', function(payload: string) {
       dispatch(payload)
       console.info(`
           Bridge load !
         `)
     })
   })
   ```

   **Advance**: You can also create a process like [this](./src/bridge/index.ts#L62-L99) for function calling or properties reading.

Once `QWebChannel` initialized, `dispatch` will be invoked when `Cpp` function named `emitEmbeddedPageLoad` return a value ([async notification](https://doc.qt.io/qt-5/qtwebchannel-javascript.html#interacting-with-qobjects)). `dispatch` function would play a **navigator** role in `JS` side.

## Usage

1. In `Qt` side, all entry point should be based on root path - `https://<YOUR_HOST>/`. All navigation will be distributed by `JS` side (`vue-router`, a kind of front-end router) rather than `Qt`, `Qt` side would has more opportunities to focus on other bussiness logic.

1. Be careful any external link and redirect uri from any external web site like `Alipay` online payment links. If you want to respect any redirect uri and prevent navigation from above `dispatch` function, you **MUST** provide **non-root** redirect uri (eg. `https://<YOUR_HOST>/#/I_AM_REDIRECTED_FROM_OHTER_SITE`). You can find more details from [here](./src/bridge/index.ts#L19-L21).
