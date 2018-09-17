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

/** QueryBuilder with custom value editor    */
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

                if (this.props.field !== 'isDev' ) {
                    return <input type="text"
                                  value={this.props.value}
                                  onChange={e => this.props.handleOnChange(e.target.value)} />
                }

                return (
                    <span>
                        <input type="checkbox"
                               value={!!this.props.value}
                               onChange={e => this.props.handleOnChange(e.target.checked)} />
                    </span>
                );
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
                    <QueryBuilder fields={fields}
                                  query={this.state.query}
                                  controlElements={controlElements}
                                  controlClassnames={{ fields: 'form-control' }}
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
