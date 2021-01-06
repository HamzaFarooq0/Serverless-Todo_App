import { ApolloProvider } from '@apollo/client';
import { client } from './client';
const React = require('react');

export const wrapRootElement = ({ element }) => <ApolloProvider client={client}>{element}</ApolloProvider>;
