import shortid from 'shortid';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import RuleGroup from '../RuleGroup';
import ActionElement from '../ActionElement';
import ValueSelector from '../ValueSelector';
import ValueEditor from '../ValueEditor';
import _ from 'lodash';


function queryToString(query) {
    if (!query) {
        return '';
    }

    let i, length;
    let result;

    if (query.type === 'group') {
        result = '(';

        for (i = 0, length = query.rules.length; i < length; ++i) {
            result += queryToString(query.rules[i]);

            if (i + 1 < length) {
                result += ' ' + query.combinator + ' ';
            }
        }

        result += ')';
    }
    else if (query.type === 'rule') {
        result = query.field + ' ' + query.operator + ' ' + query.value;
    }
    else {
        console.error('invalid type: type must be Group or Rule');
        return '';
    }

    return result;
}


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
        this.mergeProperties = this.mergeProperties.bind(this);
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

    /**
     * Iterates through the query to return a human format string query
     * @param query
     * @returns {string|*}
     */
    static getQueryString(query) {
        return queryToString(query);
    };

    /**
     * Checks the values passed as props to override the default values if specified
     * @param defaultValues
     * @param passedValues
     * @returns {*}
     */
    mergeProperties(defaultValues, passedValues) {
        return _.mergeWith(defaultValues, passedValues, function (objValue, srcValue) {
            if (srcValue) {
                return srcValue;
            }
            return objValue;
        });
    }

    componentWillMount() {
        const { fields, operators, combinators, controlElements } = this.props;
        const controls = Object.assign({},this.mergeProperties(QueryBuilder.defaultControlElements, controlElements));
        this.setState({
            root: this.getInitialQuery(),
            schema: {
                fields,
                operators,
                combinators,
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
        const { translations, controlClassNames } = this.props;
        const updatedClassNames = Object.assign({},this.mergeProperties(QueryBuilder.defaultClassNames, controlClassNames));
        const updatedTranslations = Object.assign({},this.mergeProperties(QueryBuilder.defaultTranslations, translations));
        return (
            <div className={`${updatedClassNames.queryBuilder}`}>
                <RuleGroup
                    classNames={updatedClassNames}
                    translations={updatedTranslations}
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
        return rule.type === 'group';
    }

    createRule() {
        const { fields, operators } = this.state.schema;

        return {
            id: `r-${shortid.generate()}`,
            type: 'rule',
            field: fields[0].name,
            value: '',
            operator: operators[0].name
        };
    }

    createRuleGroup() {
        return {
            id: `g-${shortid.generate()}`,
            type: 'group',
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

    /**
     * Removes the given rule by id from the tree
     * @param ruleId
     * @param parentId
     */
    onRuleRemove(ruleId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x => x.id === ruleId);

        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    }

    /**
     * Removes the given group by id from the tree
     * @param groupId
     * @param parentId
     */
    onGroupRemove(groupId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x => x.id === groupId);

        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    }

    getLevel(id) {
        return this._getLevel(id, 0, this.state.root)
    }

    /**
     * Searches in the root tree for rules for the id specified and returns the index of the found rule
     * @param id
     * @param index
     * @param root
     * @returns {number}
     * @private
     */
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

    /**
     * Searches the rule group for the given rule id
     * @param id
     * @param parent
     * @returns {*}
     * @private
     */
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

    /**
     * Any callback change in the tree that is made, remove,add, change of rule or group the query is cloned
     * and updated
     * @param fn
     * @param args
     * @private
     */
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

    /**
     * default control elements to merge with due to cant use default props as duplication of this component will result in the
     * others using the same control elements from other instantiations of this component
     * @returns {{addGroupAction, removeGroupAction, addRuleAction, removeRuleAction, combinatorSelector, fieldSelector, operatorSelector, valueEditor}}
     */
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
        }
    }

    /**
     * default translations to merge with due to cant use default props as duplication of this component will result in the
     * others using the same translations from other instantiations of this component
     * @returns {{fields: {title: string}, operators: {title: string}, value: {title: string}, removeRule: {label: string, title: string}, removeGroup: {label: string, title: string}, addRule: {label: string, title: string}, addGroup: {label: string, title: string}, combinators: {title: string}}}
     */
    static get defaultTranslations () {
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

    /**
     * default class names to merge with due to cant use default props as duplication of this component will result in the
     * others using the same class names from other instantiations of this component
     * @returns {{queryBuilder: string, removeRule: string, ruleGroup: string, ruleGroupHeader: string, ruleGroupContainer: string, ruleGroupCombinators: string, combinators: string, ruleGroupActions: string, addRule: string, addGroup: string, removeGroup: string, rule: string, ruleHeader: string, ruleContainer: string, fields: string, operators: string, value: string}}
     */
    static get defaultClassNames () {
        return {
            queryBuilder: 'query-builder',
            removeRule: 'group-or-rule__rule-remove',
            ruleGroup: 'group-or-rule-container__group-or-rule group-or-rule__group',
            ruleGroupHeader: 'group-or-rule__group-header',
            ruleGroupContainer: 'query-builder__group-or-rule-container group-or-rule-container__group',
            ruleGroupCombinators: 'group-or-rule__group-combinators',
            combinators: 'group-or-rule__group-combinator',
            ruleGroupActions: 'group-or-rule__group-actions',
            addRule: 'group-or-rule__ruleGroup-addRule',
            addGroup: 'group-or-rule__ruleGroup-addGroup',
            removeGroup: 'group-or-rule__ruleGroup-removeGroup',
            rule: 'group-or-rule-container__group-or-rule group-or-rule__rule',
            ruleHeader: 'group-or-rule__rule-header',
            ruleContainer: 'query-builder__group-or-rule-container group-or-rule-container__rule',
            fields: 'group-or-rule__rule-field',
            operators: 'group-or-rule__rule-operator',
            value: 'group-or-rule__rule-value',
        }
    }
}

QueryBuilder.displayName = 'QueryBuilder';

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
    },
    controlElements: {
        addGroupAction: ActionElement,
        removeGroupAction: ActionElement,
        addRuleAction: ActionElement,
        removeRuleAction: ActionElement,
        combinatorSelector: ValueSelector,
        fieldSelector: ValueSelector,
        operatorSelector: ValueSelector,
        valueEditor: ValueEditor
    },
    getOperators: null,
    onQueryChange: null,
    controlClassNames: {
        queryBuilder: 'query-builder',
        removeRule: 'group-or-rule__rule-remove',
        ruleGroup: 'group-or-rule-container__group-or-rule group-or-rule__group',
        ruleGroupHeader: 'group-or-rule__group-header',
        ruleGroupContainer: 'query-builder__group-or-rule-container group-or-rule-container__group',
        ruleGroupCombinators: 'group-or-rule__group-combinators',
        combinators: 'group-or-rule__group-combinator',
        ruleGroupActions: 'group-or-rule__group-actions',
        addRule: 'group-or-rule__ruleGroup-addRule',
        addGroup: 'group-or-rule__ruleGroup-addGroup',
        removeGroup: 'group-or-rule__ruleGroup-removeGroup',
        rule: 'group-or-rule-container__group-or-rule group-or-rule__rule',
        ruleHeader: 'group-or-rule__rule-header',
        ruleContainer: 'query-builder__group-or-rule-container group-or-rule-container__rule',
        fields: 'group-or-rule__rule-field',
        operators: 'group-or-rule__rule-operator',
        value: 'group-or-rule__rule-value',
    },
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
        addGroupAction: PropTypes.func,//returns ReactClass
        removeGroupAction: PropTypes.func,//returns ReactClass
        addRuleAction: PropTypes.func,//returns ReactClass
        removeRuleAction: PropTypes.func,//returns ReactClass
        combinatorSelector: PropTypes.func,//returns ReactClass
        fieldSelector: PropTypes.func,//returns ReactClass
        operatorSelector: PropTypes.func,//returns ReactClass
        valueEditor: PropTypes.func//returns ReactClass
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
