import LocalizedStrings from 'react-localization';

const lang_obj = {
  en: {
    currency_code: 'USD',
    language_name: 'English',
    home: {
      header_title: 'Home',
      categories: 'Categories',
      brands: 'Brands',
      recently_added: 'Recently Added',
      top_rated_products: 'Top Rated Products',
      view_all: 'View All',
    },

    drawer_labels: {
      home: 'Home',
      orders: 'Orders',
      shop_by_category: 'Shop by Category',
      profile: 'Profile',
      settings: 'Settings',
      about_us: 'About Us',
      feedback: 'Feedback',
      sign_out: 'Sign Out',
      sign_in: 'Sign In',
      create_account: 'Create Account',
    },

    settings: {
      header_title: 'Settings',
      change_language: 'Change Language',
      change_currency: 'Change Currency',
    },
  },
  it: {
    currency_code: 'EUR',
    language_name: 'Italy',
    home: {
      header_title: 'Hogar',
      categories: 'Categorías',
      brands: 'Marcas',
      recently_added: 'Recientemente añadido',
      top_rated_products: 'Productos mejor valorados',
      view_all: 'Ver todo',
    },

    drawer_labels: {
      home: 'Hogar',
      orders: 'Pedidos',
      shop_by_category: 'Compra por categoría',
      profile: 'Perfil',
      settings: 'Ajustes',
      about_us: 'Sobre nosotros',
      feedback: 'Realimentación',
      sign_out: 'Desconectar',
      sign_in: 'Registrati',
      create_account: 'Creare un profilo',
    },

    settings: {
      header_title: 'Ajustes',
      change_language: 'Cambiar idioma',
      change_currency: 'Cambiar moneda',
    },
  },
};
const lang_strings = new LocalizedStrings(lang_obj);

const currency_data = [
  {
    currency_code: 'USD',
    currency_symbol: '$',
    per_dollar_rate: 1.0,
  },
  {
    currency_code: 'EUR',
    currency_symbol: '€',
    per_dollar_rate: 0.84,
  },
  {
    currency_code: 'INR',
    currency_symbol: '₹',
    per_dollar_rate: 72.55,
  },
];

class CurrencyConverter {
  constructor(currency_data) {
    try {
      const setCurrency = (currency_code) => {
        currency_code = `${currency_code}`.toUpperCase();
        const selected_currency_data = currency_data.filter(
          (currency) => currency.currency_code == currency_code,
        );
        if (selected_currency_data.length) {
          currency_data.map(
            (currency) => currency.is_selected && delete currency.is_selected,
          );
          selected_currency_data[0].is_selected = true;
          Object.keys(selected_currency_data[0]).map((key) => {
            this[key] = selected_currency_data[0][key];
          });
        }
      };

      const getCurrency = () => {
        const filtered_currency_data = currency_data.filter(
          (currency) => currency.is_selected,
        );
        if (filtered_currency_data.length) {
          delete filtered_currency_data[0].is_selected;
          return filtered_currency_data[0];
        } else {
          delete currency_data[0].is_selected;
          return currency_data[0];
        }
      };

      const current_currency_data = getCurrency();
      Object.keys(current_currency_data).map((key) => {
        this[key] = current_currency_data[key];
      });

      this.setCurrency = (currency_code) => setCurrency(currency_code);
      this.getCurrency = getCurrency;
      this.currencyData = currency_data;
      this.getAllCurrencies = () =>
        currency_data.map((currency) => currency.currency_code);
    } catch (err) {
      console.log(
        '%c Error in currency converter class - ',
        'color: #0F9D58; font-weight: bold; text-transform: capitalize',
        err,
      );
      this.setCurrency = (currency_code) => currency_code;
      this.getCurrency = () => '';
      this.currencyData = [];
      this.getAllCurrencies = () => [];
    }
  }
}
const currency_strings = new CurrencyConverter(currency_data);

export {lang_obj, lang_strings, currency_strings};
export default lang_strings;
