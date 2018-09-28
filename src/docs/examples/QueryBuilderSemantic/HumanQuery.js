import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import QueryBuilderSemantic from 'react-query-builder-semantic/lib/QueryBuilderSemantic';

/** QueryBuilderSemantic with human query string format */
export default class HumanQuery extends React.Component {
    constructor() {
        super();
        this.state = {
            query: null
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
                    <QueryBuilderSemantic
                        fields={[
                            { value: 'firstName', text: 'First Name' },
                            { value: 'lastName', text: 'Last Name' },
                            { value: 'age', text: 'Age' },
                            { value: 'address', text: 'Address' },
                            { value: 'phone', text: 'Phone' },
                            { value: 'email', text: 'Email' },
                            { value: 'twitter', text: 'Twitter' },
                        ]}
                        query={this.state.query}
                        onQueryChange={this.logQuery} />
                </div>
                <div className="shrink query-log scroll">
                    <h4>Human Query String Format</h4>
                    <pre>{QueryBuilderSemantic.getQueryString(this.state.query)}</pre>
                </div>
            </div>
        );
    }
}
