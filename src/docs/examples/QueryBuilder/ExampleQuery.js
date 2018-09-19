import React from 'react';
import QueryBuilder from 'react-query-builder-semantic/lib/QueryBuilder';


const fields = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age' },
    { name: 'address', label: 'Address' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email' },
    { name: 'twitter', label: 'Twitter' },
    { name: 'isDev', label: 'Is a Developer?', value: false },
];

/** QueryBuilder with initial query */
export default class ExampleQuery extends React.Component {
    constructor() {
        super();
        this.state = {
            query: {
                "id": "g-9eb72517-13ec-4a49-93f5-64fd84389811",
                "type": "group",
                "rules": [
                    {
                        "id": "r-8bab2387-30c0-4c0f-a7ae-2ccc17873f92",
                        "field": "firstName",
                        "type": "rule",
                        "value": "jacques",
                        "operator": "="
                    },
                    {
                        "id": "g-821bc7e0-19a8-497b-925f-2793d92d67b6",
                        "type": "group",
                        "rules": [
                            {
                                "id": "r-97e2e20e-7d6d-40f3-b610-877325177928",
                                "field": "lastName",
                                "type": "rule",
                                "value": "nel",
                                "operator": "="
                            }
                        ],
                        "combinator": "or"
                    }
                ],
                "combinator": "and"
            }
        };
        this.logQuery = this.logQuery.bind(this)
    }

    logQuery(query) {
        this.setState({ query });
    }

    render() {
        return (
            <div className="flex-box">
                <div className="scroll">
                    <QueryBuilder fields={fields}
                                  query={this.state.query}
                                  onQueryChange={this.logQuery} />
                </div>
                <div className="shrink query-log scroll">
                    <h4>Query</h4>
                    <pre>{JSON.stringify(this.state.query, null, 2)}</pre>
                </div>
            </div>
        );
    }
}
