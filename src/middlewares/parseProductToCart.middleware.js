import { ObjectId } from "mongodb";
import { productsCollection } from "../database/collections.js";

export async function parseProductToCart(req, res, next) {
    const { id } = req.params;
    const stockToReserve = req.stockToReserve;

    try {
        const product = await productsCollection.findOne({
            _id: new ObjectId(id),
        });
        if (!product) {
            return res.status(404).send({ message: "Produto não encontrado" });
        }
        if (product.stock < stockToReserve) {
            return res
                .status(409)
                .send({ message: "Quantidade deve ser menor do que estoque" });
        }

        const productCart = { ...product, stockToReserve };
        req.product = productCart;
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    next();
}
