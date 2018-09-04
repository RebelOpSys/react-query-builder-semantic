import React from 'react';
import PropTypes from 'prop-types';

/**
 * Default element used for responding to actions in Rule or RuleGroup for the QueryBuilder
 */
const ActionElement = (props) => {
    const { label, className, handleOnClick, title } = props;
    return (
        <button className={className}
                title={title}
                onClick={e => handleOnClick(e)}>
            {label}
        </button>
    );
};

ActionElement.displayName = 'ActionElement';

ActionElement.propTypes = {
    /**
     * text to appear for element
     */
    label: PropTypes.string,
    /**
     *css classNames to be applied
     */
    className: PropTypes.string,
    /**
     * callback function to invoke when element clicked
     */
    handleOnClick: PropTypes.func,
    /**
     * html title
     */
    title: PropTypes.string,
};

export default ActionElement;
