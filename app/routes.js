import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from './components/App';
import Chart from './components/Chart';
import Grid from './components/Grid';
import History from './components/History';
import ManageTags from './components/ManageTags';
import ListTags from './components/ListTags';
import EditTag from './components/EditTag';
import NotFound from './components/NotFound';

export default function getRoutes(store) {
  const clearMessages = () => {
    store.dispatch({
      type: 'CLEAR_MESSAGES'
    });
  };
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Chart} onLeave={clearMessages}/>
      <Route path="/grid" component={Grid} />
      <Route path="/history" component={History} />
      <Route path="/tag" component={ManageTags} />
      <Route path="/list" component={ListTags} />
      <Route path="/add" component={ManageTags} />
      <Route path="/edit" component={EditTag} />
      <Route path="/delete" component={ManageTags} />
      <Route path="*" component={NotFound} onLeave={clearMessages}/>
    </Route>
  );
}
