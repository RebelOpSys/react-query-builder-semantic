import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import QueryBuilderSemantic from 'react-query-builder-semantic/lib/QueryBuilderSemantic';
import {  Input } from 'semantic-ui-react';


const fields = [
    { value: 'firstName', text: 'First Name' },
    { value: 'lastName', text: 'Last Name' },
    { value: 'age', text: 'Age' },
    { value: 'address', text: 'Address' },
    { value: 'phone', text: 'Phone' },
    { value: 'email', text: 'Email' },
];

/** QueryBuilderSemantic with custom value editor    */
export default class ExampleCustomValueEditor extends React.Component {
    constructor() {
        super();
        this.state = {
            query: null
        };
        this.logQuery = this.logQuery.bind(this);
        this.customValueEditor = this.customValueEditor.bind(this);
    }

    logQuery(query) {
        this.setState({ query });
    }

    customValueEditor() {
        let customValue = class CustomValue extends React.Component {
            constructor(props) {
                super(props);
            }

            render() {
                if (this.props.operator === 'null' || this.props.operator === 'notNull') {
                    return null;
                }
                    return <Input error={!this.props.value} className={'rule--value'}
                                  onChange={(e, { value }) => this.props.handleOnChange(value)} />
            }
        };
        return customValue;
    }

    render() {
        let controlElements = {
            valueEditor: this.customValueEditor()
        }
        return (
            <div className="flex-box">
                <div className="scroll">
                    <QueryBuilderSemantic fields={fields}
                                          query={this.state.query}
                                          buttonSize={'mini'}
                                          controlElements={controlElements}
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
