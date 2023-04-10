import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { HiCreditCard } from "react-icons/hi";
import { BsCalendar2EventFill } from "react-icons/bs";
import { MdVpnLock } from "react-icons/md";
import { GrMail } from "react-icons/gr";
import { MdAccountCircle } from "react-icons/md";
import "./Payment.css";
import { useParams , useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CheckOut = () => {

  const [name, setName] = useState("");
  //const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [subscription, setSubscription] = useState("");

  // const [package, setPackage] = useState("");

  const [pack, setPack] = useState("0");

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { priceId , email } = useParams();

  function backtochat() {
    navigate(`/chat/${email}`);
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    // let pkg = await getPackage(priceId);
    console.log(pack);
    try {
      const cardElement = elements?.getElement(CardNumberElement);
      if (!cardElement) {
        return;
      }
      console.log({ cardElement });

      const paymentMethod = await stripe?.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardNumberElement),
        // card: cardElement,
        billing_details: {
          name,
          email,
        },
      });

      console.log("paymentMethod: ", paymentMethod);

      // // call the backend to create subscription
      const response = await fetch(
        "http://localhost:4000/payment/create-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethod: paymentMethod?.paymentMethod?.id,
            name,
            email,
            priceId,
          }),
        }
      ).then((res) => res.json());

      console.log("response: ", response);

      console.log("secret: ", secret);
      console.log("subscription: ", subscription);
      console.log("response: ", response);

      if (response.clientSecret) {
        // confirm the payment by the user
        const confirmPayment = await stripe?.confirmCardPayment(
          response.clientSecret
        );

        console.log("confirmPayment", confirmPayment);
        // console.log("subscriptionId", subscriptionId);

        if (confirmPayment?.error) {
          console.log("error occ: ", confirmPayment.error.message);
        } else {
          console.log("Success! Check your email for the invoice.");

          // let data = JSON.stringify({
          //   package: "2",
          // });

          let config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://localhost:4000/payment/package/update/${email}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              package: pack,
              subscriptionId: response.subscriptionId,
            }),
          };

          const updatePackage = await axios
            .request(config)
            .then((response) => {
              console.log(JSON.stringify(response.data));
              toast.success("Payment Successfull , Now Enjoy Higher Limits");
              navigate(`/chat/${email}`);

            })
            .catch((error) => {
              //console.log(error);
              toast.error(error.message);
            });
        }
      } else {
        //console.log(response.message);
        toast.success("Payment Successfull , Now Enjoy Higher Limits");
        navigate(`/chat/${email}`);
        
      }
    } catch (error) {
      console.log("I am catch error", error);
    }
  };

  useEffect(() => {
    // scroll chat down on history change
    if (priceId == "price_1MtId7H5DTXndbM5S6011iYS") {
      setPack("1");
    } else {
      setPack("2");
    }
  }, [priceId]);

  return (
    <div className="paymentContainer">
      <form className="paymentForm" onSubmit={(e) => submitHandler(e)}>
        <p>Card Info</p>
        <div>
          <MdAccountCircle />
          <input
            type="text"
            placeholder="Enter name"
            className="paymentInput"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <GrMail />
          <input
            type="text"
            placeholder="Enter email"
            className="paymentInput"
            value={email}
            disabled
          />
        </div>

        <div>
          <HiCreditCard />
          <CardNumberElement className="paymentInput" />
        </div>
        <div>
          <BsCalendar2EventFill style={{ fontSize: "22px" }} />
          <CardExpiryElement className="paymentInput" />
        </div>
        <div>
          <MdVpnLock style={{ fontSize: "24px" }} />
          <CardCvcElement className="paymentInput" />
        </div>

        <input
          type="submit"
          // value={`Pay - ₹${orderInfo && orderInfo.totalPrice}`}
          // ref={payBtn}
          className="paymentFormBtn"
        />

      </form>
      <button
      onClick={backtochat} 
      style={{ marginTop: "50px" }}
       className="back"
       >
            Back To Chat
          </button>
    </div>
  );
};

const CheckOutWithStripe = () => (
  <Elements
    stripe={loadStripe(
      "pk_test_51KqjSfH5DTXndbM5FeV5p2pkow6DMx57X4bV7AOcUzZAt3J1LHxeOdOBLUshVyKzOaDeBGJqIRt5PDFcd5JA1VLY005qzetSFm"
    )}
  >
    <CheckOut />
  </Elements>
);

export default CheckOutWithStripe;


