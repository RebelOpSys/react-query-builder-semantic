import shortid from 'shortid';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import RuleGroup from '../RuleGroupSemantic';
import OperatorSelector from '../OperatorSelectorSemantic';
import FieldSelector from '../FieldSelectorSemantic';
import ValueEditor from '../ValueEditorSemantic';
import { Segment } from 'semantic-ui-react';
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
 * QueryBuilderSemantic is QueryBuilder with react.semantic-ui components.
 * It outputs a structured JSON of rules which can be easily parsed to create SQL/NoSQL/whatever queries.
 */
class QueryBuilderSemantic extends React.Component {

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
        const { fields, values, operators, combinators, controlElements } = this.props;
        const controls = Object.assign({}, this.mergeProperties(QueryBuilderSemantic.defaultControlElements, controlElements));
        this.setState({
            root: this.getInitialQuery(),
            schema: {
                fields,
                values,
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
        const { translations, combinatorColors, ruleSemanticProps, ruleGroupSemanticProps, controlClassNames } = this.props;
        const updatedClassNames = Object.assign({}, this.mergeProperties(QueryBuilderSemantic.defaultClassNames, controlClassNames));
        const updatedTranslations = Object.assign({}, this.mergeProperties(QueryBuilderSemantic.defaultTranslations, translations));
        return (
            <Segment.Group fluid={'true'} raised className={`${updatedClassNames.queryBuilder}`}>
                <RuleGroup
                    classNames={updatedClassNames}
                    ruleSemanticProps={ruleSemanticProps}
                    ruleGroupSemanticProps={ruleGroupSemanticProps}
                    translations={updatedTranslations}
                    combinatorColors={combinatorColors}
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
                    parentCombinator={combinator}
                />
            </Segment.Group>
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
        const { fields, operators, values } = this.state.schema;

        return {
            id: `r-${shortid.generate()}`,
            field: fields[0].value,
            type: 'rule',
            value: !_.isEmpty(values) ? values[0].value : '',
            operator: operators[0].value
        };
    }

    createRuleGroup() {
        return {
            id: `g-${shortid.generate()}`,
            type: 'group',
            rules: [],
            combinator: this.props.combinators[0].value,
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

    /*
     * default control elements to merge with due to cant use default props as duplication of this component will result in the
     * others using the same control elements from other instantiations of this component
     */
    static get defaultControlElements() {
        return {
            fieldSelector: FieldSelector,
            operatorSelector: OperatorSelector,
            valueEditor: ValueEditor
        }
    }

    /*
     * default translations to merge with due to cant use default props as duplication of this component will result in the
     * others using the same translations from other instantiations of this component
     */
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
                title: "Remove rule",
            },
            removeGroup: {
                title: "Remove group",
            },
            addRule: {
                title: "Add rule",
            },
            addGroup: {
                title: "Add group",
            },
            combinators: {
                title: "Combinators",
            }
        }
    }

    /*
     * default class names to merge with due to cant use default props as duplication of this component will result in the
     * others using the same class names from other instantiations of this component
     */
    static get defaultClassNames() {
        return {
            queryBuilder: 'query-builder',
            removeRule: 'group-or-rule__rule-remove',
            ruleGroup: 'group-or-rule-container__group-or-rule group-or-rule__group',
            ruleGroupHeader: 'group-or-rule__group-header',
            ruleGroupContainer: 'query-builder__group-or-rule-container group-or-rule-container__group',
            combinators: 'group-or-rule__group-combinator',
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

QueryBuilderSemantic.displayName = 'QueryBuilderSemantic';

QueryBuilderSemantic.defaultProps = {
    query: null,
    fields: [],
    values: [],
    operators: [
        { value: 'null', text: 'Is Null' },
        { value: 'notNull', text: 'Is Not Null' },
        { value: 'in', text: 'In' },
        { value: 'notIn', text: 'Not In' },
        { value: '=', text: '=' },
        { value: '!=', text: '!=' },
        { value: '<', text: '<' },
        { value: '>', text: '>' },
        { value: '<=', text: '<=' },
        { value: '>=', text: '>=' },
    ],
    combinatorColors: [
        { color: 'purple', combinator: 'and' },
        { color: 'blue', combinator: 'or' },
    ],
    combinators: [
        {
            text: 'AND',
            value: 'and',
            label: { color: 'purple', empty: true, circular: true },
        },
        {
            text: 'OR',
            value: 'or',
            label: { color: 'blue', empty: true, circular: true },
        }
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
            title: "Remove rule",
        },
        removeGroup: {
            title: "Remove group",
        },
        addRule: {
            title: "Add rule",
        },
        addGroup: {
            title: "Add group",
        },
        combinators: {
            title: "Combinators",
        }
    },
    controlElements: {
        fieldSelector: FieldSelector,
        operatorSelector: OperatorSelector,
        valueEditor: ValueEditor
    },
    getOperators: null,
    onQueryChange: null,
    ruleSemanticProps: {
        segment: {
            size: 'tiny',
            padded: true,
            compact: true,
        },
        valueEditor: {
            size: 'tiny',
            type: "text"
        },
        fieldSelector: {
            scrolling: true,
            selection: true,
            search: true,
        },
        operatorSelector: {
            scrolling: true,
            selection: true,
            search: true,
        },
        deleteRuleButton: {
            size: 'tiny',
            compact: true,
            circular: true,
            floated: 'right',
            icon: 'remove'
        }
    },
    ruleGroupSemanticProps: {
        dropDown: {
            attached: 'left',
            size: 'tiny',
            labeled: true,
            scrolling: true,
            selection: true,
        },
        segment: {
            size: 'tiny',
        },
        addGroupButton: {
            attached: true,
            size: 'tiny',
            compact: true,
            icon: 'plus'
        },
        removeGroupButton: {
            attached: 'right',
            size: 'tiny',
            compact: true,
            icon: 'minus'
        },
        addRuleButton: {
            attached: 'right',
            size: 'tiny',
            compact: true,
            icon: 'plus'
        },
    },
    controlClassNames: {
        queryBuilder: 'query-builder',
        removeRule: 'group-or-rule__rule-remove',
        ruleGroup: 'group-or-rule-container__group-or-rule group-or-rule__group',
        ruleGroupHeader: 'group-or-rule__group-header',
        ruleGroupContainer: 'query-builder__group-or-rule-container group-or-rule-container__group',
        combinators: 'group-or-rule__group-combinator',
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
};

QueryBuilderSemantic.propTypes = {
    /**
     * Semantic Props for valueEditor,fieldSelector,valueSelector,segment,deleteRuleButton on a rule
     */
    ruleSemanticProps: PropTypes.shape({
        /**
         * Semantic Input props on a rule
         * https://react.semantic-ui.com/elements/input/
         */
        valueEditor: PropTypes.any,
        /**
         * Semantic Dropdown props on a rule
         * https://react.semantic-ui.com/modules/dropdown/
         */
        fieldSelector: PropTypes.any,
        /**
         * Semantic Dropdown props on a rule
         * https://react.semantic-ui.com/modules/dropdown/
         */
        operatorSelector: PropTypes.any,
        /**
         * Semantic Segment props on a rule
         * https://react.semantic-ui.com/elements/segment/
         */
        segment: PropTypes.any,
        /**
         * Semantic delete Button props on a rule
         * https://react.semantic-ui.com/elements/button/
         */
        deleteRuleButton: PropTypes.any,
    }),
    /**
     * Semantic Props for dropDown,addGroupButton,removeGroupButton,segment,addRuleButton on a group
     */
    ruleGroupSemanticProps: PropTypes.shape({
        /**
         * Semantic combinator Dropdown props on a group
         * https://react.semantic-ui.com/modules/dropdown/
         */
        dropDown: PropTypes.any,
        /**
         * Semantic Segment props on a group
         * https://react.semantic-ui.com/elements/segment/
         */
        segment: PropTypes.any,
        /**
         * Semantic add group Button props on a group
         * https://react.semantic-ui.com/elements/button/
         */
        addGroupButton: PropTypes.any,
        /**
         * Semantic remove group Button props on a group
         * https://react.semantic-ui.com/elements/button/
         */
        removeGroupButton: PropTypes.any,
        /**
         * Semantic remove group Button props on a group
         * https://react.semantic-ui.com/elements/button/
         */
        addRuleButton: PropTypes.any,
    }),
    query: PropTypes.object,
    /**
     *  The array of fields that should be used. Each field should be an object with
     */
    fields: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    })).isRequired,
    /**
     *  The array of values that should be used. Each value should be an object with
     */
    values: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    })),
    /**
     The array of operators that should be used.
     */
    operators: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        text: PropTypes.string,
    })),
    /**
     * The array of combinators that should be used for RuleGroups
     */
    combinators: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        content: PropTypes.any,
        text: PropTypes.string,
    })),
    /**
     * The array of colors to use for the selected combinator
     * https://react.semantic-ui.com/elements/segment/#variations-colored
     */
    combinatorColors: PropTypes.arrayOf(PropTypes.shape({
        color: PropTypes.string.isRequired,
        combinator: PropTypes.string.isRequired,
    })),
    /**
     * This is a custom controls object that allows you to override the control elements used. The following control overrides are supported
     */
    controlElements: PropTypes.shape({
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
     * This can be used to assign specific CSS classes to various controls that are created by the QueryBuilderSemantic
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
         *<Dropdown> control for combinators
         */
        combinators: PropTypes.string,
        /**
         *<Button> to add a Rule
         */
        addRule: PropTypes.string,
        /**
         *<Button> to add a RuleGroup
         */
        addGroup: PropTypes.string,
        /**
         *<Button> to remove a RuleGroup
         */
        removeGroup: PropTypes.string,
        /**
         *<div> containing the Rule
         */
        rule: PropTypes.string,
        /**
         *<Dropdown> control for fields
         */
        fields: PropTypes.string,
        /**
         *<Dropdown> control for operators
         */
        operators: PropTypes.string,
        /**
         *<Input> for the field value
         */
        value: PropTypes.string,
        /**
         *<Button> to remove a Rule
         */
        removeRule: PropTypes.string,
    }),
    /**
     * This can be used to override translatable texts that are created by the <QueryBuilderSemantic />
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
            title: PropTypes.string
        }),
        removeGroup: PropTypes.shape({
            title: PropTypes.string
        }),
        addRule: PropTypes.shape({
            title: PropTypes.string
        }),
        addGroup: PropTypes.shape({
            title: PropTypes.string
        }),
        combinators: PropTypes.shape({
            title: PropTypes.string
        })
    }),
};

export default QueryBuilderSemantic;
