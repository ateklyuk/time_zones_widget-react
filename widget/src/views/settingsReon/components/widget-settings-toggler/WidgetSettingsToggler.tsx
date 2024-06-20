import React from 'react';
import cl from './WidgetSettingsToggler.module.scss';
import classNames from 'classnames';
import { OptionT } from '../../lib/types';
import { SettingsConfig } from '../../lib/config';

type Props = {
    selectedOption: OptionT,
    selectedOptionHandler: (option: OptionT) => void
}

const WidgetSettingsToggler = ({ selectedOption, selectedOptionHandler }: Props): JSX.Element => {

    return (
        <div className={cl['toggler-nav']}>
            {SettingsConfig.map(option =>
                <div
                    onClick={() => selectedOptionHandler(option)}
                    className={classNames(cl['toggler-nav__item'], { [cl._active]: option.id === selectedOption.id })}
                >
                    <span>{option.title}</span>
                </div>
            )}
        </div>
    )
};

export default WidgetSettingsToggler;