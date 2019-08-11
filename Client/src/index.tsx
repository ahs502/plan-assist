import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as serviceWorker from './serviceWorker';
import '@core/utils/extensions.implementation';
import '@core/utils/validation-init';
import App from './App';

ReactDOM.render(
  <Fragment>
    <CssBaseline />
    <App />
  </Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
