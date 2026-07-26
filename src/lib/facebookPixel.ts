export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const init = () => {
  if (typeof window === 'undefined') return;
  if (!FB_PIXEL_ID) return;

  if (!(window as any).fbq) {
    (window as any).fbq = function () {
      if ((window as any).fbq.callMethod) {
        (window as any).fbq.callMethod.apply((window as any).fbq, arguments);
      } else {
        (window as any).fbq.queue.push(arguments);
      }
    };
    (window as any)._fbq = (window as any).fbq;
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];
  }
};

export const pageView = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

interface EventParams {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  contents?: any[];
  search_string?: string;
}

const trackEvent = (eventName: string, params?: EventParams) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (params) {
      (window as any).fbq('track', eventName, params);
    } else {
      (window as any).fbq('track', eventName);
    }
  }
};

export const viewContent = (params: EventParams) => trackEvent('ViewContent', params);

export const addToCart = (params: EventParams) => trackEvent('AddToCart', params);

export const addToWishlist = (params?: EventParams) => trackEvent('AddToWishlist', params);

export const search = (params: EventParams) => trackEvent('Search', params);

export const initiateCheckout = (params?: EventParams) => trackEvent('InitiateCheckout', params);

export const purchase = (params: EventParams) => trackEvent('Purchase', params);

export const contact = (params?: EventParams) => trackEvent('Contact', params);

export const lead = (params?: EventParams) => trackEvent('Lead', params);
