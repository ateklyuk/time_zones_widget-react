import axios from 'axios';
import { WidgetControllerDto } from '../types/widgetControllerDto';

export const WIDGET_CONTROLLER_URL = `https://vds2151841.my-ihor.ru/informer`;

export const widgetControllerTrigger = async (leadDto: WidgetControllerDto): Promise<void> => {
    await axios.post(WIDGET_CONTROLLER_URL, leadDto);
};