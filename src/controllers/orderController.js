import Order from "../models/orderModel.js";

function mapRequestToOrderPayload(body) {
  const {
    numeroPedido,
    valorTotal,
    dataCriacao,
    items = [],
  } = body || {};

  if (!numeroPedido || typeof valorTotal !== "number" || !dataCriacao) {
    const error = new Error(
      "Campos obrigatórios: numeroPedido (string), valorTotal (number), dataCriacao (ISO string)."
    );
    error.statusCode = 400;
    throw error;
  }

  const mappedItems = items.map((item) => ({
    productId: Number(item.idItem),
    quantity: item.quantidadeItem,
    price: item.valorItem,
  }));

  return {
    orderId: numeroPedido,
    value: valorTotal,
    creationDate: new Date(dataCriacao),
    items: mappedItems,
  };
}

export async function createOrder(req, res) {
  try {
    const payload = mapRequestToOrderPayload(req.body);

    const existing = await Order.findOne({ orderId: payload.orderId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Pedido com esse numeroPedido já existe." });
    }

    const order = await Order.create(payload);
    return res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    let status = error.statusCode || 500;
    // Erros de validação do Mongoose devem ser tratados como 400
    if (!error.statusCode && error.name === "ValidationError") {
      status = 400;
    }

    return res.status(status).json({
      message:
        status === 500
          ? `Erro ao criar pedido: ${error.message}`
          : error.message || "Dados inválidos.",
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar pedido." });
  }
}

export async function listOrders(_req, res) {
  try {
    const orders = await Order.find().sort({ creationDate: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar pedidos." });
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params;

    const payload = mapRequestToOrderPayload({
      ...req.body,
      numeroPedido: id,
    });

    const updated = await Order.findOneAndUpdate(
      { orderId: id },
      payload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    return res.json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      message:
        status === 500
          ? "Erro ao atualizar pedido."
          : error.message || "Dados inválidos.",
    });
  }
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Order.findOneAndDelete({ orderId: id });

    if (!deleted) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao deletar pedido." });
  }
}

