import React from 'react';
import {
    NSAddressMultiple, NSCartResume, NSContext, NSToast, getCart, getCmsBlock, getLangPrefix
} from 'aqlrc';
import Head from 'next/head';
import CartStructure from 'components/CartStructure';
import { withI18next } from 'lib/withI18n';
import { Link, Router } from 'routes';

/**
 * CartAddress - Page des adresses client dans le panier
 * @return {React.Component}
 */

class CartAddress extends React.Component {
    static getInitialProps = async function (ctx) {
        const { cmsBlocks, lang } = ctx.nsGlobals;
        const cmsLegalTxt = await getCmsBlock('legalTxt', cmsBlocks, lang, ctx);

        return {
            cmsLegalTxt,
            userRequired : { url: '/cart/login', route: 'cartLogin' },
            layoutCms    : { header: 'header_cart', footer: 'footer_cart' }
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            ...props,
            editMode : false,
            address  : { company: {} },
            cart     : {
                items : []
            },
            isDelivery      : false,
            isBilling       : false,
            selectedCountry : {},
            useSameAddress  : false,
            selectedIndex   : -1
        };
    }

    onLangChange = async (lang) => {
        window.location.pathname = `${await getLangPrefix(lang)}/cart/address`;
    }

    componentDidMount = async () => {
        const { lang, routerLang } = this.props;
        const cartId = window.localStorage.getItem('cart_id');
        if (!cartId) {
            return Router.pushRoute('cart', { lang: routerLang });
        }

        // Récupération du panier
        try {
            const PostBody = { populate: ['items.id'] };
            const cart = await getCart(cartId, lang, PostBody);

            this.setState({ cart });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                NSToast.error(err.response.data.message);
            } else {
                NSToast.error('common:error_occured');
                console.error(err);
            }
            return setTimeout(() => {
                Router.pushRoute('cart', { lang: routerLang });
            }, 5000);
        }
    }

    render() {
        const {
            oCmsHeader, oCmsFooter, sitename, t
        } = this.props;
        const { cart } = this.state;
        return (
            <NSContext.Provider value={{ props: this.props, state: this.state, onLangChange: (l) => this.onLangChange(l) }}>
                <CartStructure oCmsFooter={oCmsFooter} oCmsHeader={oCmsHeader} step={2}>
                    <Head>
                        <title>{sitename} | {t('addresses:address_title')}</title>
                        <meta property="og:type" content="website" />
                    </Head>
                    <section className="section-shipping-address">
                        <div className="container--flex align-top">
                            { cart.items.length > 0 && (
                                <>
                                    <NSAddressMultiple t={t} gNext={{ Router }} />
                                    <NSCartResume t={t} gNext={{ Link }} />
                                </>
                            )}
                        </div>
                    </section>
                </CartStructure>
            </NSContext.Provider>
        );
    }
}

export default withI18next(['cart', 'addresses'])(CartAddress);
