import $ from 'dom7';
import Utils from '../../utils/utils';
import Modal from '../modal/modal-class';

class Popup extends Modal {
  constructor(app, params) {
    const extendedParams = Utils.extend(
      { on: {} },
      app.params.popup,
      params
    );

    // Extends with open/close Modal methods;
    super(app, extendedParams);

    const popup = this;

    popup.params = extendedParams;

    // Find Element
    let $el;
    if (!popup.params.el) {
      $el = $(popup.params.content);
    } else {
      $el = $(popup.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal;
    }

    if ($el.length === 0) {
      return popup.destroy();
    }

    let $backdropEl;
    if (popup.params.backdrop && popup.params.backdropEl) {
      $backdropEl = $(popup.params.backdropEl);
    } else if (popup.params.backdrop) {
      $backdropEl = app.root.children('.popup-backdrop');
      if ($backdropEl.length === 0) {
        $backdropEl = $('<div class="popup-backdrop"></div>');
        app.root.append($backdropEl);
      }
    }

    Utils.extend(popup, {
      app,
      $el,
      el: $el[0],
      $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'popup',
    });

    function handleClick(e) {
      const target = e.target;
      const $target = $(target);
      const keyboardOpened = !app.device.desktop && app.device.cordova && ((window.Keyboard && window.Keyboard.isVisible) || (window.cordova.plugins && window.cordova.plugins.Keyboard && window.cordova.plugins.Keyboard.isVisible));
      if (keyboardOpened) return;
      if ($target.closest(popup.el).length === 0) {
        if (
          popup.params
          && popup.params.closeByBackdropClick
          && popup.params.backdrop
          && popup.backdropEl
          && popup.backdropEl === target
        ) {
          let needToClose = true;
          popup.$el.nextAll('.popup.modal-in').each((index, popupEl) => {
            const popupInstance = popupEl.f7Modal;
            if (!popupInstance) return;
            if (
              popupInstance.params.closeByBackdropClick
              && popupInstance.params.backdrop
              && popupInstance.backdropEl === popup.backdropEl
            ) {
              needToClose = false;
            }
          });
          if (needToClose) {
            popup.close();
          }
        }
      }
    }

    function onKeyDown(e) {
      const keyCode = e.keyCode;
      if (keyCode === 27 && popup.params.closeOnEscape) {
        popup.close();
      }
    }
    if (popup.params.closeOnEscape) {
      popup.on('popupOpen', () => {
        $(document).on('keydown', onKeyDown);
      });
      popup.on('popupClose', () => {
        $(document).off('keydown', onKeyDown);
      });
    }

    popup.on('popupOpened', () => {
      if (popup.params.closeByBackdropClick) {
        app.on('click', handleClick);
      }
    });
    popup.on('popupClose', () => {
      if (popup.params.closeByBackdropClick) {
        app.off('click', handleClick);
      }
    });

    $el[0].f7Modal = popup;

    return popup;
  }
}
export default Popup;
