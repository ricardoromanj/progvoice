import React from 'react';
import Call from './Call';

import { 
  Table,
  Segment
} from 'semantic-ui-react';

const Calls = (props) => (
  <div>
    {props.calls.length === 0 && 
          <Segment raised>
            No calls have been made
          </Segment>
    }
    {props.calls.length !== 0 &&
      <Table singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>From</Table.HeaderCell>
            <Table.HeaderCell>To</Table.HeaderCell>
            <Table.HeaderCell>Server</Table.HeaderCell>
            <Table.HeaderCell>Reply</Table.HeaderCell>
            <Table.HeaderCell>At</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            props.calls.map((call, index) => (
            <Call
              key={ call.id }
              fromNum={ call.fromNum }
              toNum={ call.toNum }
              serviceName={ call.serviceName }
              serviceReply={ call.serviceReply }
              calledAt={ call.calledAt }
            />
            ))
          }
        </Table.Body>
      </Table>
    }
    </div>
);

export default Calls;
