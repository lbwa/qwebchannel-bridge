<h1 align="center">QWebChannel bridge</h1>

This project is used to describe how to integrate `QWebChannel` with `Vue plugin`.

[中文指南](https://set.sh/post/190728-intergrate-qwebchannel)

## Prerequisites

`Qt` side should provide one or more `QObject` which include all information shared with `JS` side.

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
   channel->registerObject('keyNamedContext', webBridge);
   view->page()->setWebChannel(channel);
   ```

1. In `JS` side, you should provide a init function when `QWebChannel` initialized.

   ```ts
   new QWebChannel(window.qt.webChannelTransport, function(channel) {
     const published = channel.objects.keyNamedContext
     Vue.prototype.$_bridge = published

     // This function calling will notify Qt server asynchronously
     published.emitEmbeddedPageLoad('', function(payload: string) {
       // This payload has included receiver name and its parameters.
       dispatch(payload)
       console.info(`
           Bridge load !
         `)
     })
   })
   ```

   **Advance**: You can also create a process like [these implementation](./src/bridge/index.ts#L62-L99) for function calling or properties reading with abstract `scope`.

1. `dispatch` function should include all navigation logic.

Once `QWebChannel` initialized, `dispatch` will be invoked when `Cpp` function named `emitEmbeddedPageLoad` return a value <sup>[async notification](https://doc.qt.io/qt-5/qtwebchannel-javascript.html#interacting-with-qobjects)</sup>. `dispatch` function would play a **navigator** role in `JS` side.

## How to navigate

1. In `Qt` side, all entry point should be based on **root** path - `https://<YOUR_HOST>/`. All navigation will be distributed by `JS` side (`vue-router`, a kind of front-end router) rather than `Qt`. `Qt` side would has more opportunities to focus on other business logic.

   - When `Qt` side receives a initial message from `JS` side, it should return a value which syntax should be like:

     ```ts
     interface InitialProps {
       type: string
       payload: any
     }
     ```

     ```ts
     // Actual value
     {
       type: [JS_SIDE_RECEIVER_NAME],
       payload: [OPTIONAL_PAYLOAD]
     }
     ```

   `type` property will be used to invoke `receiver` in the [RECEIVER_MAP](./src/config/bridge.ts#L3), then `payload` property including any messages from `Qt` side will passed `receiver`. `receiver` in the [RECEIVER_MAP](./src/config/bridge.ts#L3) plays a `navigator` role in front-end, and developer should add navigation logic into here. This is all secrets about front-end navigation without `Qt` routing.

   Above all process has described how to initialize `Vue.js` app in the `QWebEngine`, and how navigation works in the `Vue.js` with `QWebEngine`.

1. Be careful any external link and redirect uri from any external web site like `Alipay` online payment links. If you want to respect any redirect uri and prevent navigation from above `dispatch` function, you **MUST** provide **non-root** redirect uri (eg. `https://<YOUR_HOST>/#/I_AM_REDIRECTED_FROM_OHTER_SITE`). You can find more details from [here](./src/bridge/helper.ts#L12-L22).

## How to push message from JS side

If you want to push messages from `JS` side to `Qt` side, you can invoke the mapping of `Qt` methods in `JS` side directly:

```ts
channel.object[QT_SCOPE].methodFromCpp(payload, callback)
```

Enhance: the following logic is based on [these implementation](./src/bridge/helper.ts#L35-L59):

```ts
// with abstract scope named `scopeMapping` in Qt/JS side
// in the vue instance
this.$$pusher.scopeMapping({
  action: 'METHODS_MAPPING_IN_THE_SCOPE',
  payload: 'CALLING_PAYLOAD'
})
```

## How to push message from Qt side

[Qt signal listener mechanism](https://doc.qt.io/qt-5/qtwebchannel-javascript.html#overloaded-methods-and-signals) is a kind of good solution for communicate from Qt side to JS side. You may be wondering why we don't use signal mechanism directly to handle first frontend navigation? Because Qt side never known when frontend router is available until JS side push `loaded` message to Qt side positively.

```cpp
class WebBridge: public QObject {
  Q_OBJECT
  public slots:
    void emitEmbeddedPageLoad();

  // define your own signal
  signals:
    void signalMessageFromQt(const QString &str);
};
```

Always define all available signal listeners in [config/bridge.ts](./src/config/bridge.ts#L27), and all signal would be handled automatically by [these codes](./src/bridge/helper.ts#L70-L84):

```ts
interface SignalCallbacks {
  [targetSignal: string]: Function
}
```
