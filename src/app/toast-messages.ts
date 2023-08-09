import {Message} from 'primeng/api';
import cloneDeep from 'lodash-es/cloneDeep';

const toastMessages: {[s: string]: Message} = {
  security_reason: {
    severity: 'error',
    detail: 'Ошибка подключения по VNC. Причина: {message}'
  },
  security: {
    severity: 'error',
    detail: 'Ошибка подключения по VNC'
  },
  connection_lost: {
    severity: 'error',
    detail: 'Потеряно соединение с сервером по VNC'
  },
  clipboard_get: {
    severity: 'success',
    detail: 'Удаленный буфер обмена успешно получен'
  },
  clipboard_disabled: {
    severity: 'error',
    detail: 'Буфер обмена недоступен. Причина: {message}'
  },
  screenshot_error: {
    severity: 'error',
    detail: 'Ошибка получения скриншота. Причина: {message}'
  }
};

export const getToastMessage = (type: string, message: string | null = null): Message => {
  const toastMessage: Message = cloneDeep(toastMessages[type]);
  if (message) {
    toastMessage.detail = toastMessage.detail?.replace('{message}', message);
  }
  return toastMessage;
}
