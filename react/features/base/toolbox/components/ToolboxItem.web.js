// @flow

import Tooltip from '@atlaskit/tooltip';
import React, { Fragment } from 'react';

import { Icon } from '../../icons';
import JitsiMeetJS from '../../lib-jitsi-meet';

import Platform from './../../../base/react/Platform.web';
import AbstractToolboxItem from './AbstractToolboxItem';
import type { Props } from './AbstractToolboxItem';

const { browser } = JitsiMeetJS.util;

/**
 * Web implementation of {@code AbstractToolboxItem}.
 */
export default class ToolboxItem extends AbstractToolboxItem<Props> {
    /**
     * Initializes a new {@code ToolboxItem} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onKeyPress = this._onKeyPress.bind(this);
    }

    _onKeyPress: (Object) => void;

    /**
     * Handles 'Enter' and Space key on the button to trigger onClick for accessibility.
     *
     * @param {Object} event - The key event.
     * @private
     * @returns {void}
     */
    _onKeyPress(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.props.onClick();
        }
    }

    /**
     * Handles rendering of the actual item. If the label is being shown, which
     * is controlled with the `showLabel` prop, the item is rendered for its
     * display in an overflow menu, otherwise it will only have an icon, which
     * can be displayed on any toolbar.
     *
     * @protected
     * @returns {ReactElement}
     */
    _renderItem() {
        const {
            disabled,
            elementAfter,
            onClick,
            showLabel,
            tooltipPosition,
            toggled
        } = this.props;
        const className = showLabel ? 'overflow-menu-item' : 'toolbox-button';
        const props = {
            'aria-pressed': toggled,
            'aria-disabled': disabled,
            'aria-label': this.accessibilityLabel,
            className: className + (disabled ? ' disabled' : ''),
            onClick: disabled ? undefined : onClick,
            onKeyPress: this._onKeyPress,
            tabIndex: 0,
            role: showLabel ? 'menuitem' : 'button'
        };

        const elementType = showLabel ? 'li' : 'div';
        const hasTooltip = this.tooltip && this.tooltip.length > 0;
        const useTooltip = Platform.OS === 'ios' && browser.isSafari() ? false : hasTooltip;
        let children = (
            <Fragment>
                { this._renderIcon() }
                { showLabel && <span>
                    { this.label }
                </span> }
                { elementAfter }
            </Fragment>
        );

        if (useTooltip) {
            children = (
                <Tooltip
                    content = { this.tooltip }
                    position = { tooltipPosition }>
                    { children }
                </Tooltip>
            );
        }

        return React.createElement(elementType, props, children);
    }

    /**
     * Helper function to render the item's icon.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderIcon() {
        const { customClass, disabled, icon, showLabel, toggled } = this.props;
        const iconComponent = <Icon src = { icon } />;
        const elementType = showLabel ? 'span' : 'div';
        const className = `${showLabel ? 'overflow-menu-item-icon' : 'toolbox-icon'} ${
            toggled ? 'toggled' : ''} ${disabled ? 'disabled' : ''} ${customClass ?? ''}`;

        return React.createElement(elementType, { className }, iconComponent);
    }
}
