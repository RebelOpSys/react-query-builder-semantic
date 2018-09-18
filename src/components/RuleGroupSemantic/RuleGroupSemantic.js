import React from 'react';
import RuleSemantic from '../RuleSemantic';
import PropTypes from 'prop-types';
import { Button, Dropdown, Segment } from 'semantic-ui-react';

/**
 * Default element to group rules for the QueryBuilderSemantic
 */
class RuleGroupSemantic extends React.Component {
    constructor(props) {
        super(props);
        this.getColorForCombinator = this.getColorForCombinator.bind(this);
    }

    /**
     * Based on the combinatorColors prop, will check the selected value of the combinator for the group
     * and return the color for that combination
     * @returns {String}
     */
    getColorForCombinator() {
        const combination = this.props.combinatorColors.filter((colorCombination) => {
            return colorCombination.combinator === this.props.combinator
        });

        if (combination) {
            return combination[0].color;
        }
    }

    render() {
        const {
            combinator, rules, translations, onRuleRemove, createRule, onRuleAdd, createRuleGroup, onGroupAdd, onGroupRemove,
            isRuleGroup, getLevel, getOperators, onPropChange,ruleSemanticProps, ruleGroupSemanticProps,
            schema: { combinators, classNames }
        } = this.props;
        return (
            <div className={`${classNames.ruleGroupContainer}`}>
                <Segment.Group {...ruleGroupSemanticProps.segment} className={`${classNames.ruleGroup}`}>
                    <div className={'group--header'}>
                        <Dropdown
                            {...ruleGroupSemanticProps.dropDown}
                            onChange={this.onCombinatorChange}
                            options={combinators}
                            defaultValue={combinator}
                        />
                        <Button
                            {...ruleGroupSemanticProps.addRuleButton}
                            className={classNames.addRule}
                            content={translations.addRule.title}
                            onClick={this.addRule}
                        />
                        <Button
                            {...ruleGroupSemanticProps.addGroupButton}
                            className={classNames.addGroup}
                            content={translations.addGroup.title}
                            onClick={this.addGroup}
                        />
                        {
                            this.hasParentGroup() ?
                                <Button
                                    {...ruleGroupSemanticProps.removeGroupButton}
                                    className={classNames.removeGroup}
                                    content={translations.removeGroup.title}
                                    onClick={this.removeGroup}
                                /> : null
                        }
                    </div>
                    <div className="group--children">
                        {
                            rules.map(rule => {
                                return (
                                    isRuleGroup(rule)
                                        ? <RuleGroupSemantic key={rule.id}
                                                             id={rule.id}
                                                             ruleGroupSemanticProps={ruleGroupSemanticProps}
                                                             ruleSemanticProps={ruleSemanticProps}
                                                             schema={this.props.schema}
                                                             parentId={this.props.id}
                                                             onGroupAdd={onGroupAdd}
                                                             getLevel={getLevel}
                                                             isRuleGroup={isRuleGroup}
                                                             createRuleGroup={createRuleGroup}
                                                             onGroupRemove={onGroupRemove}
                                                             onPropChange={onPropChange}
                                                             onRuleAdd={onRuleAdd}
                                                             onRuleRemove={onRuleRemove}
                                                             createRule={createRule}
                                                             getOperators={getOperators}
                                                             combinator={rule.combinator}
                                                             combinatorColors={this.props.combinatorColors}
                                                             translations={this.props.translations}
                                                             rules={rule.rules} />
                                        : <RuleSemantic
                                            key={rule.id}
                                            id={rule.id}
                                            ruleSemanticProps={ruleSemanticProps}
                                            field={rule.field}
                                            value={rule.value}
                                            getOperators={getOperators}
                                            onPropChange={onPropChange}
                                            combinator={combinator}
                                            combinatorColor={this.getColorForCombinator()}
                                            getLevel={getLevel}
                                            operator={rule.operator}
                                            schema={this.props.schema}
                                            parentId={this.props.id}
                                            translations={this.props.translations}
                                            onRuleRemove={onRuleRemove}
                                        />
                                );
                            })
                        }
                    </div>
                </Segment.Group>
            </div>
        );
    }

    hasParentGroup() {
        return this.props.parentId;
    }

    onCombinatorChange = (e, { value }) => {
        const { onPropChange } = this.props;
        onPropChange('combinator', value, this.props.id);
    };

    addRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { createRule, onRuleAdd } = this.props;

        const newRule = createRule();
        onRuleAdd(newRule, this.props.id)
    };

    addGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { createRuleGroup, onGroupAdd } = this.props;
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, this.props.id)
    };

    removeGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.onGroupRemove(this.props.id, this.props.parentId);
    };


}

RuleGroupSemantic.propTypes = {
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
        valueSelector: PropTypes.any,
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
    /**
     * This is a callback function invoked to get the list of allowed operators for the given field
     */
    getOperators: PropTypes.func,
    /**
     * This is a callback function invoked to return the current level for this rule
     */
    getLevel: PropTypes.func,
    /**
     * This is a callback function invoked when a rule is removed
     */
    onRuleRemove: PropTypes.func,
    /**
     * This is a callback function invoked notify this ruleGroup has made a property change for combinator
     */
    onPropChange: PropTypes.func,
    /**
     * This is a callback function invoked when this RuleGroup is removed
     */
    onGroupRemove: PropTypes.func,
    /**
     * This is a callback function to return a new default RuleGroup
     */
    createRuleGroup: PropTypes.func,
    /**
     * This is a callback function invoked when clicking on creating a new RuleGroup
     */
    onGroupAdd: PropTypes.func,
    /**
     * This is a callback function to return a new default Rule
     */
    createRule: PropTypes.func,
    /**
     * This is a callback function invoked when clicking on creating a new Rule
     */
    onRuleAdd: PropTypes.func,
    /**
     * This is a callback function invoked to determine if the element is a RuleGroup
     */
    isRuleGroup: PropTypes.func,
    /**
     * Random generated id for rule
     */
    id: PropTypes.any.isRequired,
    /**
     *  Id for the RuleGroup this RuleGroup is nested in
     */
    parentId: PropTypes.any,
    /**
     * Array of current Rules
     */
    rules: PropTypes.array,
    /**
     * Selected combinator value
     */
    combinator: PropTypes.string.isRequired,
    /**
     * Current schema from QueryBuilder
     */
    schema: PropTypes.object,
    /**
     * This can be used to override translatable texts and
     * icons applied to various controls that are created by the <QueryBuilderSemantic />
     * https://react.semantic-ui.com/elements/icon/
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
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        removeGroup: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        addRule: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        addGroup: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        combinators: PropTypes.shape({
            title: PropTypes.string
        })
    }),
    /**
     * The array of colors to use for the selected combinator
     * https://react.semantic-ui.com/elements/segment/#variations-colored
     */
    combinatorColors: PropTypes.arrayOf(PropTypes.shape({
        color: PropTypes.string.isRequired,
        combinator: PropTypes.string.isRequired,
    })),
};

RuleGroupSemantic.defaultProps = {
    id: null,
    parentId: null,
    rules: [],
    combinator: 'and',
    schema: {},
};


export default RuleGroupSemantic;
