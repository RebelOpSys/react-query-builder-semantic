import shortid from 'shortid';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import RuleGroup from '../RuleGroup';
import ActionElement from '../ActionElement';
import ValueSelector from '../ValueSelector';
import ValueEditor from '../ValueEditor';

/**
 * QueryBuilder is an UI component to create queries and filters.
 * It outputs a structured JSON of rules which can be easily parsed to create SQL/NoSQL/whatever queries.
 */
class QueryBuilder extends React.Component {

    constructor(...args) {
        super(...args);
        this.state = {
            root: {},
            schema: {},
        };

        this.createRule = this.createRule.bind(this);
        this.createRuleGroup = this.createRuleGroup.bind(this);
        this.onRuleAdd = this._notifyQueryChange.bind(this, this.onRuleAdd);
        this.onGroupAdd = this._notifyQueryChange.bind(this, this.onGroupAdd);
        this.onRuleRemove = this._notifyQueryChange.bind(this, this.onRuleRemove);
        this.onGroupRemove = this._notifyQueryChange.bind(this, this.onGroupRemove);
        this.onPropChange = this._notifyQueryChange.bind(this, this.onPropChange);
        this.getLevel = this.getLevel.bind(this);
        this.isRuleGroup = this.isRuleGroup.bind(this);
        this.getOperators = this.getOperators.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let schema = { ...this.state.schema };

        if (this.props.query !== nextProps.query) {
            this.setState({ root: nextProps.query });
        }

        if (schema.fields !== nextProps.fields) {
            schema.fields = nextProps.fields;
            this.setState({ schema });
        }

    }

    componentWillMount() {
        const { fields, operators, combinators, controlElements, controlClassNames } = this.props;
        const classNames = Object.assign({}, QueryBuilder.defaultControlClassNames, controlClassNames);
        const controls = Object.assign({}, QueryBuilder.defaultControlElements, controlElements);
        this.setState({
            root: this.getInitialQuery(),
            schema: {
                fields,
                operators,
                combinators,
                classNames,
                controls,
            }
        });

    }

    getInitialQuery() {
        return this.props.query || this.createRuleGroup();
    }

    componentDidMount() {
        this._notifyQueryChange(null);
    }

    render() {
        const { root: { id, rules, combinator }, schema } = this.state;
        const { translations } = this.props;

        return (
            <div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
                <RuleGroup
                    translations={translations}
                    rules={rules}
                    createRule={this.createRule}
                    createRuleGroup={this.createRuleGroup}
                    onRuleAdd={this.onRuleAdd}
                    onGroupAdd={this.onGroupAdd}
                    onRuleRemove={this.onRuleRemove}
                    onGroupRemove={this.onGroupRemove}
                    isRuleGroup={this.isRuleGroup}
                    getLevel={this.getLevel}
                    onPropChange={this.onPropChange}
                    getOperators={(...args) => this.getOperators(...args)}
                    combinator={combinator}
                    schema={schema}
                    id={id}
                    parentId={null}
                />
            </div>
        );
    }

    /**
     * Returns true if the rule is a RuleGroup with rules
     * @param rule
     * @returns {boolean}
     */
    isRuleGroup(rule) {
        return !!(rule.combinator && rule.rules);
    }

    createRule() {
        const { fields, operators } = this.state.schema;

        return {
            id: `r-${shortid.generate()}`,
            field: fields[0].name,
            value: '',
            operator: operators[0].name
        };
    }

    createRuleGroup() {
        return {
            id: `g-${shortid.generate()}`,
            rules: [],
            combinator: this.props.combinators[0].name,
        };
    }

    getOperators(field) {
        if (this.props.getOperators) {
            const ops = this.props.getOperators(field);
            if (ops) {
                return ops;
            }
        }
        return this.props.operators;
    }

    onRuleAdd(rule, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(rule);

        this.setState({ root: this.state.root });
    }

    onGroupAdd(group, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(group);

        this.setState({ root: this.state.root });
    }

    onPropChange(prop, value, ruleId) {
        const rule = this._findRule(ruleId, this.state.root);
        Object.assign(rule, { [prop]: value });

        this.setState({ root: this.state.root });
    }

    onRuleRemove(ruleId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x => x.id === ruleId);

        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    }

    onGroupRemove(groupId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x => x.id === groupId);

        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    }

    getLevel(id) {
        return this._getLevel(id, 0, this.state.root)
    }

    _getLevel(id, index, root) {
        let foundAtIndex = -1;
        if (root.id === id) {
            foundAtIndex = index;
        } else if (this.isRuleGroup(root)) {
            root.rules.forEach(rule => {
                if (foundAtIndex === -1) {
                    let indexForRule = index;
                    if (this.isRuleGroup(rule))
                        indexForRule++;
                    foundAtIndex = this._getLevel(id, indexForRule, rule);
                }
            });
        }
        return foundAtIndex;

    }

    _findRule(id, parent) {
        if (parent.id === id) {
            return parent;
        }

        for (const rule of parent.rules) {
            if (rule.id === id) {
                return rule;
            } else if (this.isRuleGroup(rule)) {
                const subRule = this._findRule(id, rule);
                if (subRule) {
                    return subRule;
                }
            }
        }

    }

    _notifyQueryChange(fn, ...args) {
        if (fn) {
            fn.call(this, ...args);
        }

        const { onQueryChange } = this.props;
        if (onQueryChange) {
            const query = cloneDeep(this.state.root);
            onQueryChange(query);
        }
    }

    static get defaultTranslations() {

        return {
            fields: {
                title: "Fields",
            },
            operators: {
                title: "Operators",
            },
            value: {
                title: "Value",
            },
            removeRule: {
                label: "x",
                title: "Remove rule",
            },
            removeGroup: {
                label: "x",
                title: "Remove group",
            },
            addRule: {
                label: "+Rule",
                title: "Add rule",
            },
            addGroup: {
                label: "+Group",
                title: "Add group",
            },
            combinators: {
                title: "Combinators",
            }
        }
    }

    static get defaultOperators() {

        return [
            {name: 'null', label: 'Is Null'},
            {name: 'notNull', label: 'Is Not Null'},
            {name: 'in', label: 'In'},
            {name: 'notIn', label: 'Not In'},
            {name: '=', label: '='},
            {name: '!=', label: '!='},
            {name: '<', label: '<'},
            {name: '>', label: '>'},
            {name: '<=', label: '<='},
            {name: '>=', label: '>='},
        ];
    }

    static get defaultCombinators() {

        return [
            {name: 'and', label: 'AND'},
            {name: 'or', label: 'OR'},
        ];
    }

    static get defaultControlClassNames() {
        return {
            queryBuilder: '',
            ruleGroup: '',
            combinators: '',
            addRule: '',
            addGroup: '',
            removeGroup: '',
            rule: '',
            fields: '',
            operators: '',
            value: '',
            removeRule: '',

        };
    }

    static get defaultControlElements() {
        return {
            addGroupAction: ActionElement,
            removeGroupAction: ActionElement,
            addRuleAction: ActionElement,
            removeRuleAction: ActionElement,
            combinatorSelector: ValueSelector,
            fieldSelector: ValueSelector,
            operatorSelector: ValueSelector,
            valueEditor: ValueEditor
        };
    }

}

QueryBuilder.defaultProps = {
    query: null,
    fields: [],
    operators: [
        { name: 'null', label: 'Is Null' },
        { name: 'notNull', label: 'Is Not Null' },
        { name: 'in', label: 'In' },
        { name: 'notIn', label: 'Not In' },
        { name: '=', label: '=' },
        { name: '!=', label: '!=' },
        { name: '<', label: '<' },
        { name: '>', label: '>' },
        { name: '<=', label: '<=' },
        { name: '>=', label: '>=' },
    ],
    combinators: [
        { name: 'and', label: 'AND' },
        { name: 'or', label: 'OR' },
    ],
    translations: {
        fields: {
            title: "Fields",
        },
        operators: {
            title: "Operators",
        },
        value: {
            title: "Value",
        },
        removeRule: {
            label: "x",
            title: "Remove rule",
        },
        removeGroup: {
            label: "x",
            title: "Remove group",
        },
        addRule: {
            label: "+ Rule",
            title: "Add rule",
        },
        addGroup: {
            label: "+ Group",
            title: "Add group",
        },
        combinators: {
            title: "Combinators",
        }
    },
    controlElements: QueryBuilder.defaultControlElements,
    getOperators: null,
    onQueryChange: null,
    controlClassNames: QueryBuilder.defaultControlClassNames
};

QueryBuilder.propTypes = {
    query: PropTypes.object,
    /**
     *  The array of fields that should be used. Each field should be an object with
     The Id is optional, if you do not provide an id for a field then the name will be used
     */
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        id: PropTypes.string
    })).isRequired,
    /**
     The array of operators that should be used.
     */
    operators: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })),
    /**
     * The array of combinators that should be used for RuleGroups
     */
    combinators: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })),
    /**
     * This is a custom controls object that allows you to override the control elements used. The following control overrides are supported
     */
    controlElements: PropTypes.shape({
        addGroupAction: PropTypes.func,
        removeGroupAction: PropTypes.func,
        addRuleAction: PropTypes.func,
        removeRuleAction: PropTypes.func,
        combinatorSelector: PropTypes.func,
        fieldSelector: PropTypes.func,
        operatorSelector: PropTypes.func,
        valueEditor: PropTypes.func
    }),
    /**
     * This is a callback function invoked to get the list of allowed operators for the given field
     */
    getOperators: PropTypes.func,
    /**
     * This is a notification that is invoked anytime the query configuration changes
     */
    onQueryChange: PropTypes.func,
    /**
     * This can be used to assign specific CSS classes to various controls that are created by the
     */
    controlClassNames: PropTypes.shape({
        /**
         *Root <div> element
         */
        queryBuilder: PropTypes.string,
        /**
         *<div> containing the RuleGroup
         */
        ruleGroup: PropTypes.string,
        /**
         *<select> control for combinators
         */
        combinators: PropTypes.string,
        /**
         *<button> to add a Rule
         */
        addRule: PropTypes.string,
        /**
         *<button> to add a RuleGroup
         */
        addGroup: PropTypes.string,
        /**
         *<button> to remove a RuleGroup
         */
        removeGroup: PropTypes.string,
        /**
         *<div> containing the Rule
         */
        rule: PropTypes.string,
        /**
         *<select> control for fields
         */
        fields: PropTypes.string,
        /**
         *<select> control for operators
         */
        operators: PropTypes.string,
        /**
         *<input> for the field value
         */
        value: PropTypes.string,
        /**
         *<button> to remove a Rule
         */
        removeRule: PropTypes.string,
    }),
    /**
     * This can be used to override translatable texts applied to various controls that are created by the <QueryBuilder />
     */
    translations: PropTypes.shape({
        fields: PropTypes.shape({
            title: PropTypes.string
        }),
        operators: PropTypes.shape({
            title: PropTypes.string
        }),
        value: PropTypes.shape({
            title: PropTypes.string
        }),
        removeRule: PropTypes.shape({
            label: PropTypes.string,
            title: PropTypes.string
        }),
        removeGroup: PropTypes.shape({
            label: PropTypes.string,
            title: PropTypes.string
        }),
        addRule: PropTypes.shape({
            label: PropTypes.string,
            title: PropTypes.string
        }),
        addGroup: PropTypes.shape({
            label: PropTypes.string,
            title: PropTypes.string
        }),
        combinators: PropTypes.shape({
            title: PropTypes.string
        })
    }),
};

export default QueryBuilder;
