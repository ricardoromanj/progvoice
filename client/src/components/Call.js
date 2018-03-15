import React from 'react';
import { Table } from 'semantic-ui-react';

const Call = (props) => (
  <Table.Row>
    <Table.Cell>{ props.fromNum }</Table.Cell>
    <Table.Cell>{ props.toNum }</Table.Cell>
    <Table.Cell>{ props.serviceName }</Table.Cell>
    <Table.Cell>{ props.serviceReply }</Table.Cell>
    <Table.Cell>{ props.calledAt }</Table.Cell>
  </Table.Row>
);

export default Call;
