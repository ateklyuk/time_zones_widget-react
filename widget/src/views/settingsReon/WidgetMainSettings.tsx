import React, { useState } from 'react';
import WidgetSettingsLayout from './components/widget-settings-layout/WidgetSettingsLayout';
import WidgetSettingsToggler from './components/widget-settings-toggler/WidgetSettingsToggler';
import classes from './WidgetMainSettings.module.scss';
import classNames from 'classnames';
import { SettingsConfig } from './lib/config';
import { OptionT } from './lib/types';

const SettingsModalWindow = (): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState<OptionT>(SettingsConfig[0]);

    const selectedOptionHandler = (option: OptionT): void => {
        setSelectedOption(option)
    }

    return (
        <div className={classNames(classes['container'])}>
            <div className={classNames(classes['container__text-block'])}>
                <div className={classNames(classes['container__text'])}>
                    Во время установки виджета крайне важно <span style={{ fontWeight: 700 }}>корректно заполнить</span> обязательные поля “Имя” и “Телефон”. После заполнения данных необходимо обязательно нажать на кнопку “Сохранить”. По указанному номеру телефона через WhatsApp производится подтверждение ID вашего аккаунта amoCRM и активация виджета.
                </div>
            </div>
            <WidgetSettingsToggler
                selectedOption={selectedOption}
                selectedOptionHandler={selectedOptionHandler}
            />
            {
                
            }
            <WidgetSettingsLayout selectedOptionId={selectedOption.id} />
        </div>
    )
};

export default SettingsModalWindow;
