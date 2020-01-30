export default class PskModel {

    static setModel(_model) {
        let root = undefined;

        function makeChain(parentChain, currentChain) {
            return parentChain ? parentChain + "." + currentChain : currentChain
        }

        function makeSetter(parentChain) {
            return function (obj, prop, value) {
                let chain = makeChain(parentChain, prop);
                if (typeof value === "object") {
                    obj[prop] = proxify(value, chain);
                    proxifyNestedObjects(obj[prop]);
                } else {
                    obj[prop] = value;
                }
                root.notify(parentChain, prop);
                return true;
            }
        }

        function makeArrayGetter(parentChain) {
            return function (target, prop) {
                const val = target[prop];
                if (typeof val === 'function') {
                    if (['push', 'unshift', 'pop', 'copyWithin'].includes(prop)) {
                        return function (el) {
                            try {
                                let returnedValue = Array.prototype[prop].apply(target, arguments);
                                root.notify(parentChain, prop);
                                return returnedValue;
                            } catch (e) {
                                console.log("An error occured in Proxy");
                                throw e;
                            }
                        }
                    }

                    return val.bind(target);
                }
                return val;
            }
        }

        function proxifyNestedObjects(obj) {
            for (let prop in obj) {
                if (typeof obj[prop] === "object") {
                    obj[prop] = obj[prop];
                    proxifyNestedObjects(obj[prop]);
                }
            }
        }

        function proxify(obj, parentChain) {
            let isRoot = !parentChain;
            let notify, onChange;
            if (isRoot) {
                let observers = {};
                notify = function (parentChain, property) {
                    let changedChain = property;
                    if (parentChain) {
                        changedChain = parentChain + "." + changedChain;
                    }

                    function notifyChain(queryChain) {
                        let chain = observers[queryChain];
                        if (chain) {
                            chain.forEach(callback => {
                                callback(changedChain);
                            });
                        }
                    }

                    notifyChain(changedChain);
                    notifyChain("*");
                };

                onChange = function (chain, callback) {
                    if (typeof callback === "function") {
                        if (!observers[chain]) {
                            observers[chain] = [];
                        }
                        observers[chain].push(callback);
                    }
                }
            }
            let setter = makeSetter(parentChain);

            let objectHandler = {
                get: function (obj, prop) {
                    if (isRoot) {
                        switch (prop) {
                            case "onChange":
                                return onChange;
                            case "notify":
                                return notify;
                        }
                    }

                    return obj[prop];
                },
                set: makeSetter(parentChain),

                deleteProperty: function (oTarget, sKey) {
                    delete oTarget[sKey];
                },

                ownKeys: function (oTarget) {
                    return Object.keys(oTarget);
                },
                has: function (oTarget, sKey) {
                    return sKey in oTarget
                },
                defineProperty: function (oTarget, sKey, oDesc) {
                    let oDescClone = Object.assign({}, oDesc);
                    oDescClone.set = function (obj, prop, value) {
                        if (oDesc.hasOwnProperty("set")) {
                            oDesc.set(obj, prop, value);
                        }
                        setter(obj, prop, value);
                    };
                    return Object.defineProperty(oTarget, sKey, oDescClone);
                },
                getOwnPropertyDescriptor: function (oTarget, sKey) {
                    return Object.getOwnPropertyDescriptor(oTarget, sKey)
                }
            };

            let arrayHandler = {
                get: makeArrayGetter(parentChain),
                set: makeSetter(parentChain)
            };

            let handler = Array.isArray(obj) ? arrayHandler : objectHandler
            return new Proxy(obj, handler);
        }

        root = proxify(_model);
        proxifyNestedObjects(root);
        return root;
    }
}