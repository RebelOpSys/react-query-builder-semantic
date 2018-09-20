import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import QueryBuilderSemantic from 'react-query-builder-semantic/lib/QueryBuilderSemantic';


const fields = [
    { value: 'firstName', text: 'First Name' },
    { value: 'lastName', text: 'Last Name' },
    { value: 'age', text: 'Age' },
    { value: 'address', text: 'Address' },
    { value: 'phone', text: 'Phone' },
    { value: 'email', text: 'Email' },
    { value: 'twitter', text: 'Twitter' },
];

/** QueryBuilderSemantic with initial query */
export default class ExampleQuery extends React.Component {
    constructor() {
        super();
        this.state = {
            query:{
                "id": "g-NDJp297p2",
                "type": "group",
                "rules": [
                    {
                        "id": "r-QaAQfsjcr",
                        "field": "firstName",
                        "type": "rule",
                        "value": "Jacques",
                        "operator": "="
                    },
                    {
                        "id": "r-UIoU-TpXU",
                        "field": "lastName",
                        "type": "rule",
                        "value": "Nel",
                        "operator": "="
                    },
                    {
                        "id": "g-EoSx7qSNE",
                        "type": "group",
                        "rules": [
                            {
                                "id": "r-fbx87YJ3G",
                                "field": "age",
                                "type": "rule",
                                "value": "35",
                                "operator": ">"
                            },
                            {
                                "id": "r-9ge_85CmZ",
                                "field": "lastName",
                                "type": "rule",
                                "value": "Nel",
                                "operator": "="
                            }
                        ],
                        "combinator": "and"
                    }
                ],
                "combinator": "or"
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
                    <QueryBuilderSemantic fields={fields}
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
