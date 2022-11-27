import chalk from "chalk";
import dayjs from "dayjs";
import { cartsCollection } from "../database/collections.js";

export async function getCart(req, res) {
    const cart = req.cart;

    try {
        cart.totalItens = 0;
        cart.subtotalPrice = 0;
        cart.products.forEach((p) => {
            cart.totalItens += p.stockToReserve;
            cart.subtotalPrice += p.price * p.stockToReserve;
        });

        res.send(cart);
    } catch (error) {
        console.log(
            chalk.redBright(
                dayjs().format("YYYY-MM-DD HH:mm:ss"),
                error.message
            )
        );
        return res.sendStatus(500);
    }
}

export async function updateCart(req, res) {
    const user = req.user;
    const cart = req.cart;
    const productCart = req.productCart;

    try {
        const cartProductList = [...cart.products];
        const finderProduct = (p) => {
            return p._id.toString() === productCart._id.toString();
        };
        const productFind = cartProductList.find((p) => finderProduct(p));
        const indexProductFind = cartProductList.findIndex((p) =>
            finderProduct(p)
        );

        if (productFind) {
            cartProductList[indexProductFind].stockToReserve =
                productCart.stockToReserve;
        } else {
            cartProductList.push(productCart);
        }

        const filterCart = { userId: user.id };
        const updateProductsCart = {
            $set: {
                products: cartProductList,
                modifyAt: dayjs().format("DD-MM-YYYY HH:mm:ss"),
            },
        };
        const { matchedCount } = await cartsCollection.updateOne(
            filterCart,
            updateProductsCart
        );
        if (!matchedCount) {
            console.log(
                chalk.bold.redBright(
                    dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    "- ERROR: user unregistered"
                )
            );
            return res.status(500).send({
                message: "Erro durante o atualização do Carrinho",
            });
        }
        return res.sendStatus(204);
    } catch (error) {
        console.log(
            chalk.redBright(
                dayjs().format("YYYY-MM-DD HH:mm:ss"),
                error.message
            )
        );
        return res.sendStatus(500);
    }
}

export async function cleanCart(req, res) {
    const user = req.user;

    try {
        await cartsCollection.replaceOne(
            { userId: user.id },
            {
                userId: user.id,
                products: [],
            }
        );
        res.sendStatus(200);
    } catch (error) {
        console.log(
            chalk.redBright(
                dayjs().format("YYYY-MM-DD HH:mm:ss"),
                error.message
            )
        );
        return res.sendStatus(500);
    }
}
