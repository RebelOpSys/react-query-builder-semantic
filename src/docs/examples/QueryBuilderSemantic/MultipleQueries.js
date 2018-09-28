import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Accordion, Button, Icon } from 'semantic-ui-react';
import shortid from 'shortid';
import _ from 'lodash';
import QueryBuilderSemantic from 'react-query-builder-semantic/lib/QueryBuilderSemantic';


/** QueryBuilderSemantic with an accordion using more than one instance of the QueryBuilderSemantic */
export default class MultipleQueries extends React.Component {
    constructor() {
        super();
        this.state = {
            logic_expressions: [
                {
                    id: shortid.generate(), query: {
                        "id": "g-aHPVisz4wlV",
                        "type": "group",
                        "rules": [
                            {
                                "id": "r-zjf42oy5y",
                                "type": "rule",
                                "value": "",
                                "operator": "contains"
                            },
                            {
                                "id": "r-1xyjnjpjO",
                                "type": "rule",
                                "value": "",
                                "operator": "contains"
                            },
                            {
                                "id": "g-QvaNvKkI9",
                                "type": "group",
                                "rules": [],
                                "combinator": "and"
                            }
                        ],
                        "combinator": "and"
                    }
                },
                { id: shortid.generate(), query: null },
                { id: shortid.generate(), query: null },
                { id: shortid.generate(), query: null },
            ],
            selectedLogicIndex: 0,
        };
        this.logQuery = this.logQuery.bind(this);
        this.onQueryChange = this.onQueryChange.bind(this);
        this.handleAddLogicExpression = this.handleAddLogicExpression.bind(this);
        this.handleAccordionClick = this.handleAccordionClick.bind(this);
    }

    logQuery(query) {
        this.setState({ query });
    }


    /**
     * Handles the adding of a logic expression
     */
    handleAddLogicExpression() {
        const logic_expressions = this.state.logic_expressions;
        logic_expressions.push({ id: shortid.generate(), query: null });
        this.setState({
            selectedLogicIndex: logic_expressions.length - 1,
            logic_expressions,
        });
    }

    /**
     * Whenever a change is made to the QueryBuilder for a particular logic expression update the query for that logic expression
     * @param query
     * @param expressionId
     */
    onQueryChange(query, expressionId) {
        const logic_expressions = this.state.logic_expressions;
        _.forEach(logic_expressions, (expression) => {
            if (expression.id === expressionId) {
                // eslint-disable-next-line no-param-reassign
                expression.query = query;
            }
        });

        this.setState({ logic_expressions });
    }

    /**
     * Handles on click on logic Expression Accordion
     * @param e
     * @param itemProps
     */
    handleAccordionClick(e, itemProps) {
        const { index } = itemProps;
        const { selectedLogicIndex } = this.state;
        if(selectedLogicIndex !== index){
            this.setState({ selectedLogicIndex: index });
        }
    }

    render() {
        return (
            <div className="flex-box">
                <div className="scroll">
                    <Button icon onClick={this.handleAddLogicExpression}>
                        <Icon name="add" />Add Expression
                    </Button>
                    <Accordion fluid >
                        {/* eslint-disable react/no-array-index-key */}
                        {this.state.logic_expressions.map((expression, index) =>
                            (<div>
                                <Accordion.Title
                                    key={`acct-${expression.id}`}
                                    index={index}
                                    onClick={this.handleAccordionClick}
                                    active={this.state.selectedLogicIndex === index}
                                >
                                    <Icon name="dropdown" />
                                    {expression.id}
                                </Accordion.Title>
                                <Accordion.Content key={`acc-${expression.id}`} index={index} active={this.state.selectedLogicIndex === index}>
                                    <div>
                                        <QueryBuilderSemantic
                                            key={`query-${expression.id}`}
                                            operators={[
                                                {
                                                    key: `${expression.id}-${shortid.generate()}`,
                                                    value: 'contains',
                                                    text: 'has'
                                                },
                                                {
                                                    key: `${expression.id}-${shortid.generate()}`,
                                                    value: 'equals',
                                                    text: '='
                                                },
                                            ]}
                                            fields={[
                                                {
                                                    value: 'firstName',
                                                    text: 'First Name'
                                                },
                                                {
                                                    value: 'lastName',
                                                    text: 'Last Name'
                                                },
                                                {
                                                    value: 'age',
                                                    text: 'Age'
                                                },
                                                {
                                                    value: 'address',
                                                    text: 'Address'
                                                },
                                                {
                                                    value: 'phone',
                                                    text: 'Phone'
                                                },
                                                {
                                                    value: 'email',
                                                    text: 'email'
                                                },
                                            ]}
                                            translations={{
                                                fields: {
                                                    title: 'Fields',
                                                },
                                                operators: {
                                                    title: 'Operators',
                                                },
                                                value: {
                                                    title: 'Value',
                                                },
                                                removeRule: {
                                                    title: 'Rule',
                                                },
                                                removeGroup: {
                                                    title: 'Group',
                                                },
                                                addRule: {
                                                    title: 'Rule',
                                                },
                                                addGroup: {
                                                    title: 'Group',
                                                },
                                                combinators: {
                                                    title: 'Combinators',
                                                },
                                            }}
                                            query={expression.query}
                                            onQueryChange={(query) => this.onQueryChange(query, expression.id)}
                                        />
                                    </div>
                                </Accordion.Content>
                            </div>),
                        )}
                    </Accordion>
                </div>
                <div className="shrink query-log scroll">
                    <h4>Query for {this.state.logic_expressions[this.state.selectedLogicIndex].id}</h4>
                    <pre>{JSON.stringify(this.state.logic_expressions[this.state.selectedLogicIndex].query, null, 2)}</pre>
                </div>
            </div>
        );
    }
}
