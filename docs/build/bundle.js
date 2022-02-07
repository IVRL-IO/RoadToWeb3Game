
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/componets/navbar.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$1 = "src/componets/navbar.svelte";

    // (141:8) {:else }
    function create_else_block(ctx) {
        let a;
        let mounted;
        let dispose;

        const block = {
            c: function create() {
                a = element("a");
                a.textContent = "Connect Wallet";
                attr_dev(a, "class", "navbar-brand");
                attr_dev(a, "href", "#connect");
                add_location(a, file$1, 141, 12, 4564);
            },
            m: function mount(target, anchor) {
                insert_dev(target, a, anchor);

                if (!mounted) {
                    dispose = listen_dev(a, "click", /*login*/ ctx[2], false, false, false);
                    mounted = true;
                }
            },
            p: noop,
            d: function destroy(detaching) {
                if (detaching) detach_dev(a);
                mounted = false;
                dispose();
            }
        };

        dispatch_dev("SvelteRegisterBlock", {
            block,
            id: create_else_block.name,
            type: "else",
            source: "(141:8) {:else }",
            ctx
        });

        return block;
    }

    // (138:8) {#if wallet.connected}
    function create_if_block$1(ctx) {
        let a;

        let t_value = (/*wallet*/ ctx[0].account
            ? /*wallet*/ ctx[0].account
            : "") + "";

        let t;
        let mounted;
        let dispose;

        const block = {
            c: function create() {
                a = element("a");
                t = text(t_value);
                attr_dev(a, "class", "navbar-brand");
                attr_dev(a, "href", "#connect");
                add_location(a, file$1, 138, 12, 4432);
            },
            m: function mount(target, anchor) {
                insert_dev(target, a, anchor);
                append_dev(a, t);

                if (!mounted) {
                    dispose = listen_dev(a, "click", /*login*/ ctx[2], false, false, false);
                    mounted = true;
                }
            },
            p: function update(ctx, dirty) {
                if (dirty & /*wallet*/ 1 && t_value !== (t_value = (/*wallet*/ ctx[0].account
                    ? /*wallet*/ ctx[0].account
                    : "") + "")) set_data_dev(t, t_value);
            },
            d: function destroy(detaching) {
                if (detaching) detach_dev(a);
                mounted = false;
                dispose();
            }
        };

        dispatch_dev("SvelteRegisterBlock", {
            block,
            id: create_if_block$1.name,
            type: "if",
            source: "(138:8) {#if wallet.connected}",
            ctx
        });

        return block;
    }

    function create_fragment$1(ctx) {
        let nav1;
        let nav0;
        let a0;
        let img;
        let img_src_value;
        let t0;
        let t1;
        let button;
        let span0;
        let t2;
        let div;
        let ul;
        let li0;
        let a1;
        let t4;
        let li1;
        let span1;
        let t5;
        let t6_value = /*socket*/ ctx[1].usersTotal + "";
        let t6;
        let t7;
        let li2;
        let span2;
        let t8;
        let t9_value = /*socket*/ ctx[1].users + "";
        let t9;
        let t10;
        let li3;
        let span3;
        let t11;
        let t12_value = /*socket*/ ctx[1].value + "";
        let t12;
        let t13;
        let li4;
        let span4;
        let t14;
        let t15_value = /*wallet*/ ctx[0].gasPrice + "";
        let t15;
        let t16;
        let span5;

        function select_block_type(ctx, dirty) {
            if (/*wallet*/ ctx[0].connected) return create_if_block$1;
            return create_else_block;
        }

        let current_block_type = select_block_type(ctx);
        let if_block = current_block_type(ctx);

        const block = {
            c: function create() {
                nav1 = element("nav");
                nav0 = element("nav");
                a0 = element("a");
                img = element("img");
                t0 = text("\n            IStoleThis");
                t1 = space();
                button = element("button");
                span0 = element("span");
                t2 = space();
                div = element("div");
                ul = element("ul");
                li0 = element("li");
                a1 = element("a");
                a1.textContent = "Documentation";
                t4 = space();
                li1 = element("li");
                span1 = element("span");
                t5 = text("Connected Users: ");
                t6 = text(t6_value);
                t7 = space();
                li2 = element("li");
                span2 = element("span");
                t8 = text("User in round: ");
                t9 = text(t9_value);
                t10 = space();
                li3 = element("li");
                span3 = element("span");
                t11 = text("Estimated NFT Value: ");
                t12 = text(t12_value);
                t13 = space();
                li4 = element("li");
                span4 = element("span");
                t14 = text("Gas Price: ");
                t15 = text(t15_value);
                t16 = space();
                span5 = element("span");
                if_block.c();
                if (!src_url_equal(img.src, img_src_value = "GoldPoo.png")) attr_dev(img, "src", img_src_value);
                set_style(img, "max-height", "32px");
                add_location(img, file$1, 105, 12, 3210);
                attr_dev(a0, "class", "navbar-brand text-danger");
                attr_dev(a0, "href", "/");
                add_location(a0, file$1, 104, 8, 3152);
                attr_dev(nav0, "class", "navbar");
                add_location(nav0, file$1, 103, 4, 3123);
                attr_dev(span0, "class", "navbar-toggler-icon");
                add_location(span0, file$1, 110, 8, 3518);
                attr_dev(button, "class", "navbar-toggler");
                attr_dev(button, "type", "button");
                attr_dev(button, "data-toggle", "collapse");
                attr_dev(button, "data-target", "#navbarSupportedContent");
                attr_dev(button, "aria-controls", "navbarSupportedContent");
                attr_dev(button, "aria-expanded", "false");
                attr_dev(button, "aria-label", "Toggle navigation");
                add_location(button, file$1, 109, 4, 3311);
                attr_dev(a1, "class", "nav-link");
                attr_dev(a1, "href", "#Docs");
                add_location(a1, file$1, 116, 16, 3736);
                attr_dev(li0, "class", "nav-item");
                add_location(li0, file$1, 115, 12, 3698);
                attr_dev(span1, "class", "nav-link");
                add_location(span1, file$1, 119, 16, 3855);
                attr_dev(li1, "class", "nav-item");
                add_location(li1, file$1, 118, 12, 3817);
                attr_dev(span2, "class", "nav-link");
                add_location(span2, file$1, 123, 16, 3991);
                attr_dev(li2, "class", "nav-item");
                add_location(li2, file$1, 122, 12, 3953);
                attr_dev(span3, "class", "nav-link");
                add_location(span3, file$1, 127, 16, 4120);
                attr_dev(li3, "class", "nav-item");
                add_location(li3, file$1, 126, 12, 4082);
                attr_dev(span4, "class", "nav-link");
                add_location(span4, file$1, 131, 16, 4255);
                attr_dev(li4, "class", "nav-item");
                add_location(li4, file$1, 130, 12, 4217);
                attr_dev(ul, "class", "navbar-nav mr-auto");
                add_location(ul, file$1, 114, 8, 3654);
                attr_dev(div, "class", "collapse navbar-collapse");
                attr_dev(div, "id", "navbarSupportedContent");
                add_location(div, file$1, 113, 4, 3579);
                attr_dev(span5, "class", "navbar-text");
                add_location(span5, file$1, 136, 4, 4362);
                attr_dev(nav1, "class", "navbar navbar-expand-lg justify-content-between");
                add_location(nav1, file$1, 101, 0, 3029);
            },
            l: function claim(nodes) {
                throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
            },
            m: function mount(target, anchor) {
                insert_dev(target, nav1, anchor);
                append_dev(nav1, nav0);
                append_dev(nav0, a0);
                append_dev(a0, img);
                append_dev(a0, t0);
                append_dev(nav1, t1);
                append_dev(nav1, button);
                append_dev(button, span0);
                append_dev(nav1, t2);
                append_dev(nav1, div);
                append_dev(div, ul);
                append_dev(ul, li0);
                append_dev(li0, a1);
                append_dev(ul, t4);
                append_dev(ul, li1);
                append_dev(li1, span1);
                append_dev(span1, t5);
                append_dev(span1, t6);
                append_dev(ul, t7);
                append_dev(ul, li2);
                append_dev(li2, span2);
                append_dev(span2, t8);
                append_dev(span2, t9);
                append_dev(ul, t10);
                append_dev(ul, li3);
                append_dev(li3, span3);
                append_dev(span3, t11);
                append_dev(span3, t12);
                append_dev(ul, t13);
                append_dev(ul, li4);
                append_dev(li4, span4);
                append_dev(span4, t14);
                append_dev(span4, t15);
                append_dev(nav1, t16);
                append_dev(nav1, span5);
                if_block.m(span5, null);
            },
            p: function update(ctx, [dirty]) {
                if (dirty & /*socket*/ 2 && t6_value !== (t6_value = /*socket*/ ctx[1].usersTotal + "")) set_data_dev(t6, t6_value);
                if (dirty & /*socket*/ 2 && t9_value !== (t9_value = /*socket*/ ctx[1].users + "")) set_data_dev(t9, t9_value);
                if (dirty & /*socket*/ 2 && t12_value !== (t12_value = /*socket*/ ctx[1].value + "")) set_data_dev(t12, t12_value);
                if (dirty & /*wallet*/ 1 && t15_value !== (t15_value = /*wallet*/ ctx[0].gasPrice + "")) set_data_dev(t15, t15_value);

                if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
                    if_block.p(ctx, dirty);
                } else {
                    if_block.d(1);
                    if_block = current_block_type(ctx);

                    if (if_block) {
                        if_block.c();
                        if_block.m(span5, null);
                    }
                }
            },
            i: noop,
            o: noop,
            d: function destroy(detaching) {
                if (detaching) detach_dev(nav1);
                if_block.d();
            }
        };

        dispatch_dev("SvelteRegisterBlock", {
            block,
            id: create_fragment$1.name,
            type: "component",
            source: "",
            ctx
        });

        return block;
    }

    async function connectEther(privKey) {

    }

    async function logOut() {
        console.log("logged out");
    }

    function instance$1($$self, $$props, $$invalidate) {
        let { $$slots: slots = {}, $$scope } = $$props;
        validate_slots('Navbar', slots, []);

        let { socket = {
            users: 1,
            usersTotal: 2,
            value: "1 ETH | $2,881.29"
        } } = $$props;

        let { wallet = {
            account: "",
            connected: false,
            gasPrice: 0,
            balance: 0
        } } = $$props;

        const web3authSdk = window.Web3auth;
        let web3AuthInstance = null;

        web3AuthInstance = new web3authSdk.Web3Auth({
                                                        chainConfig: { chainNamespace: "eip155" },
                                                        clientId: "BNp9wPRk6KyzQT-hn3vZv-Epw-UA7IA0G_ufVIzDOahRkKcZgoIxEaincfYNSWO2Fn9ueJnIj5xJBkoVj3Nj5sM", // get your clientId from https://dashboard.web3auth.io

                                                    });

        subscribeAuthEvents(web3AuthInstance);
        web3AuthInstance.initModal();

        async function initWeb3() {
            // we can access this provider on `web3AuthInstance` only after user is logged in.
            // This provider is also returned as a response of `connect` function in step 4. You can use either ways.
            const web3 = new Web3(web3AuthInstance.provider);

            $$invalidate(0, wallet.account = web3.eth.getAccounts()[0], wallet);
            $$invalidate(0, wallet.balance = web3.eth.getBalance(wallet.account), wallet);
        }

        if (web3AuthInstance.provider) {
            const user = web3AuthInstance.getUserInfo();
            console.log("got it");
            console.dir(user);
            initWeb3();
        }

        function handleAccountsChanged(accounts) {
            if (accounts.length === 0) {
                // MetaMask is locked or the user has not connected any accounts
                console.log('Please connect to MetaMask.');
            } else if (accounts[0] !== wallet.account) {
                $$invalidate(0, wallet.account = accounts[0], wallet);
            } // Do any other work!
        }

        let web3A = null;

        function subscribeAuthEvents(web3auth) {
            web3auth.on("connected", data => {
                const web3 = new Web3(web3auth.provider);

                web3.eth.getAccounts().then(function (accounts) {
                    $$invalidate(0, wallet.connected = true, wallet);
                    $$invalidate(0, wallet.account = accounts[0], wallet);
                    web3A = web3auth;
                });
                console.log("Yeah!, you are successfully logged in", data);
            });

            web3auth.on("connecting", () => {
                console.log("connecting");
            });

            web3auth.on("disconnected", () => {
                console.log("disconnected");
            });

            web3auth.on("errored", error => {
                console.log("some error or user have cancelled login request", error);
            });

            web3auth.on("MODAL_VISIBILITY", isVisible => {
                console.log("modal visibility", isVisible);
            });
        }

        /* Authentication code */
        async function login() {
            if (wallet.account) {
                await web3A.logout().then(function () {
                    $$invalidate(0, wallet.account = null, wallet);
                    $$invalidate(0, wallet.connected = false, wallet);
                });
            } else {
                await web3AuthInstance.connect();
            }
        }

        const writable_props = ['socket', 'wallet'];

        Object.keys($$props).forEach(key => {
            if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Navbar> was created with unknown prop '${key}'`);
        });

        $$self.$$set = $$props => {
            if ('socket' in $$props) $$invalidate(1, socket = $$props.socket);
            if ('wallet' in $$props) $$invalidate(0, wallet = $$props.wallet);
        };

        $$self.$capture_state = () => ({
            socket,
            wallet,
            web3authSdk,
            web3AuthInstance,
            initWeb3,
            handleAccountsChanged,
            web3A,
            subscribeAuthEvents,
            connectEther,
            login,
            logOut
        });

        $$self.$inject_state = $$props => {
            if ('socket' in $$props) $$invalidate(1, socket = $$props.socket);
            if ('wallet' in $$props) $$invalidate(0, wallet = $$props.wallet);
            if ('web3AuthInstance' in $$props) web3AuthInstance = $$props.web3AuthInstance;
            if ('web3A' in $$props) web3A = $$props.web3A;
        };

        if ($$props && "$$inject" in $$props) {
            $$self.$inject_state($$props.$$inject);
        }

        return [wallet, socket, login];
    }

    class Navbar extends SvelteComponentDev {
        constructor(options) {
            super(options);
            init(this, options, instance$1, create_fragment$1, safe_not_equal, { socket: 1, wallet: 0 });

            dispatch_dev("SvelteRegisterComponent", {
                component: this,
                tagName: "Navbar",
                options,
                id: create_fragment$1.name
            });
        }

        get socket() {
            throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
        }

        set socket(value) {
            throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
        }

        get wallet() {
            throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
        }

        set wallet(value) {
            throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
        }
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    // (47:8) {#if wallet.showErrorMsg}
    function create_if_block(ctx) {
        let div2;
        let div1;
        let div0;

        const block = {
            c: function create() {
                div2 = element("div");
                div1 = element("div");
                div0 = element("div");
                div0.textContent = "HEY! You need your wallet connected. Stealing NFTs is one thing, wanting a free ride tsk tsk.";
                attr_dev(div0, "class", "alert alert-warning");
                attr_dev(div0, "role", "alert");
                add_location(div0, file, 49, 20, 1683);
                attr_dev(div1, "class", "col col-md-6 offset-md-3 ");
                add_location(div1, file, 48, 16, 1623);
                attr_dev(div2, "class", "row");
                add_location(div2, file, 47, 12, 1589);
            },
            m: function mount(target, anchor) {
                insert_dev(target, div2, anchor);
                append_dev(div2, div1);
                append_dev(div1, div0);
            },
            d: function destroy(detaching) {
                if (detaching) detach_dev(div2);
            }
        };

        dispatch_dev("SvelteRegisterBlock", {
            block,
            id: create_if_block.name,
            type: "if",
            source: "(47:8) {#if wallet.showErrorMsg}",
            ctx
        });

        return block;
    }

    function create_fragment(ctx) {
        let meta;
        let link;
        let t0;
        let main;
        let navbar;
        let t1;
        let div12;
        let div1;
        let div0;
        let img;
        let img_src_value;
        let t2;
        let t3;
        let div4;
        let div3;
        let div2;
        let t5;
        let div11;
        let div10;
        let div9;
        let div8;
        let t6;
        let div7;
        let t7;
        let div5;
        let t9;
        let div6;
        let t11;
        let script;
        let script_src_value;
        let current;
        let mounted;
        let dispose;
        navbar = new Navbar({ $$inline: true });
        let if_block = /*wallet*/ ctx[0].showErrorMsg && create_if_block(ctx);

        const block = {
            c: function create() {
                meta = element("meta");
                link = element("link");
                t0 = space();
                main = element("main");
                create_component(navbar.$$.fragment);
                t1 = space();
                div12 = element("div");
                div1 = element("div");
                div0 = element("div");
                img = element("img");
                t2 = space();
                if (if_block) if_block.c();
                t3 = space();
                div4 = element("div");
                div3 = element("div");
                div2 = element("div");
                div2.textContent = "Didn't you know stealing was bad? Don't click/press/right-click the button.";
                t5 = space();
                div11 = element("div");
                div10 = element("div");
                div9 = element("div");
                div8 = element("div");
                t6 = text("What is this? A game where you try to steal the winning nft. When you press the button or right\n                        click it\n                        your wallet will open to enter the round.\n                        ");
                div7 = element("div");
                t7 = text("Everyone will get an NFT for round. You can opt of minting on loss. Only 1 person will get\n                            the treasure and it's the 2nd to last in\n                            the round.\n                            ");
                div5 = element("div");
                div5.textContent = "Why second to last? You very naughty and used a DMCA notice to steal from the original\n                                artist even!";
                t9 = space();
                div6 = element("div");
                div6.textContent = "Choose your gas wisely as you can delay a transaction buy setting low gas or execute\n                                instantly with\n                                high gas.";
                t11 = space();
                script = element("script");
                attr_dev(meta, "name", "color-scheme");
                attr_dev(meta, "content", "dark light");
                add_location(meta, file, 1, 4, 18);
                attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css");
                attr_dev(link, "rel", "stylesheet");
                attr_dev(link, "media", "(prefers-color-scheme: dark)");
                add_location(link, file, 2, 4, 70);
                if (!src_url_equal(img.src, img_src_value = "button.png")) attr_dev(img, "src", img_src_value);
                set_style(img, "background-repeat", "no-repeat");
                set_style(img, "min-height", "200px");
                set_style(img, "max-height", "800px");
                add_location(img, file, 42, 16, 1327);
                attr_dev(div0, "class", "col col-md-2 offset-md-4 svelte-4odomw");
                toggle_class(div0, "active", /*active*/ ctx[1]);
                add_location(div0, file, 39, 12, 1169);
                attr_dev(div1, "class", "row align-self-center");
                set_style(div1, "min-height", "148px");
                set_style(div1, "text-align", "center");
                add_location(div1, file, 38, 8, 1075);
                attr_dev(div2, "class", "alert alert-warning");
                attr_dev(div2, "role", "alert");
                add_location(div2, file, 57, 16, 2057);
                attr_dev(div3, "class", "col col-md-6 offset-md-3 ");
                add_location(div3, file, 56, 12, 2001);
                attr_dev(div4, "class", "row align-items-end align-self-end");
                add_location(div4, file, 55, 8, 1939);
                add_location(div5, file, 72, 28, 2931);
                add_location(div6, file, 75, 28, 3131);
                add_location(div7, file, 68, 24, 2670);
                add_location(div8, file, 65, 20, 2446);
                attr_dev(div9, "class", "alert alert-info");
                attr_dev(div9, "role", "alert");
                add_location(div9, file, 64, 16, 2382);
                attr_dev(div10, "class", "col col-md-6 offset-md-3");
                add_location(div10, file, 63, 12, 2326);
                attr_dev(div11, "class", "row align-items-end align-self-end");
                add_location(div11, file, 62, 8, 2265);
                attr_dev(div12, "class", "container-fluid");
                add_location(div12, file, 36, 4, 1036);
                if (!src_url_equal(script.src, script_src_value = "https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/js/darkmode.js")) attr_dev(script, "src", script_src_value);
                add_location(script, file, 85, 4, 3475);
                add_location(main, file, 33, 0, 1010);
            },
            l: function claim(nodes) {
                throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
            },
            m: function mount(target, anchor) {
                append_dev(document.head, meta);
                append_dev(document.head, link);
                insert_dev(target, t0, anchor);
                insert_dev(target, main, anchor);
                mount_component(navbar, main, null);
                append_dev(main, t1);
                append_dev(main, div12);
                append_dev(div12, div1);
                append_dev(div1, div0);
                append_dev(div0, img);
                append_dev(div12, t2);
                if (if_block) if_block.m(div12, null);
                append_dev(div12, t3);
                append_dev(div12, div4);
                append_dev(div4, div3);
                append_dev(div3, div2);
                append_dev(div12, t5);
                append_dev(div12, div11);
                append_dev(div11, div10);
                append_dev(div10, div9);
                append_dev(div9, div8);
                append_dev(div8, t6);
                append_dev(div8, div7);
                append_dev(div7, t7);
                append_dev(div7, div5);
                append_dev(div7, t9);
                append_dev(div7, div6);
                append_dev(main, t11);
                append_dev(main, script);
                current = true;

                if (!mounted) {
                    dispose = [
                        listen_dev(img, "mouseup", /*buttonRelease*/ ctx[3], false, false, false),
                        listen_dev(img, "touchend", /*buttonRelease*/ ctx[3], false, false, false),
                        listen_dev(div0, "mousedown", /*buttonPress*/ ctx[2], false, false, false),
                        listen_dev(div0, "touchstart", /*buttonPress*/ ctx[2], false, false, false)
                    ];

                    mounted = true;
                }
            },
            p: function update(ctx, [dirty]) {
                if (dirty & /*active*/ 2) {
                    toggle_class(div0, "active", /*active*/ ctx[1]);
                }

                if (/*wallet*/ ctx[0].showErrorMsg) {
                    if (if_block) ; else {
                        if_block = create_if_block(ctx);
                        if_block.c();
                        if_block.m(div12, t3);
                    }
                } else if (if_block) {
                    if_block.d(1);
                    if_block = null;
                }
            },
            i: function intro(local) {
                if (current) return;
                transition_in(navbar.$$.fragment, local);
                current = true;
            },
            o: function outro(local) {
                transition_out(navbar.$$.fragment, local);
                current = false;
            },
            d: function destroy(detaching) {
                detach_dev(meta);
                detach_dev(link);
                if (detaching) detach_dev(t0);
                if (detaching) detach_dev(main);
                destroy_component(navbar);
                if (if_block) if_block.d();
                mounted = false;
                run_all(dispose);
            }
        };

        dispatch_dev("SvelteRegisterBlock", {
            block,
            id: create_fragment.name,
            type: "component",
            source: "",
            ctx
        });

        return block;
    }

    function instance($$self, $$props, $$invalidate) {
        let { $$slots: slots = {}, $$scope } = $$props;
        validate_slots('App', slots, []);
        let wallet = { connected: false, showErrorMsg: false };
        let active = false;
        wallet.connected = typeof window.ethereum !== 'undefined';

        function buttonPress(event) {
            $$invalidate(1, active = !active);
            event.target.src = 'buttonPushed.png';

            if (wallet.connected && wallet.showErrorMsg === false) {
                $$invalidate(0, wallet.showErrorMsg = true, wallet);
            }
        }

        function buttonRelease(event) {
            $$invalidate(1, active = !active);
            event.target.src = 'button.png';

            if (wallet.connected && wallet.showErrorMsg === false) {
                $$invalidate(0, wallet.showErrorMsg = true, wallet);
            }
        }

        const writable_props = [];

        Object.keys($$props).forEach(key => {
            if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
        });

        $$self.$capture_state = () => ({
            Navbar,
            wallet,
            active,
            buttonPress,
            buttonRelease
        });

        $$self.$inject_state = $$props => {
            if ('wallet' in $$props) $$invalidate(0, wallet = $$props.wallet);
            if ('active' in $$props) $$invalidate(1, active = $$props.active);
        };

        if ($$props && "$$inject" in $$props) {
            $$self.$inject_state($$props.$$inject);
        }

        return [wallet, active, buttonPress, buttonRelease];
    }

    class App extends SvelteComponentDev {
        constructor(options) {
            super(options);
            init(this, options, instance, create_fragment, safe_not_equal, {});

            dispatch_dev("SvelteRegisterComponent", {
                component: this,
                tagName: "App",
                options,
                id: create_fragment.name
            });
        }
    }

    const app = new App({
                            target: document.body,
                            props: {
                                name: 'world'
                            }
                        });

    return app;

})();
//# sourceMappingURL=bundle.js.map
