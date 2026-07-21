export interface ModelPricing {
  readonly inputPerMillionTokensUsd: number;
  readonly outputPerMillionTokensUsd: number;
}

const TOKENS_PER_MILLION = 1_000_000;
const COST_DECIMAL_PLACES = 6;
const COST_ROUNDING_FACTOR = 10 ** COST_DECIMAL_PLACES;

const MODEL_PRICING: Readonly<Record<string, ModelPricing>> = Object.freeze({
  'gpt-5.5': Object.freeze({
    inputPerMillionTokensUsd: 5,
    outputPerMillionTokensUsd: 30,
  }),
});

/** Calculates estimated standard API costs from provider-reported token usage. */
export class CostCalculator {
  public constructor(
    private readonly pricingByModel: Readonly<Record<string, ModelPricing>> = MODEL_PRICING,
  ) {}

  public estimateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number | null {
    const pricing = this.pricingByModel[model];

    if (pricing === undefined) {
      return null;
    }

    const cost =
      (inputTokens / TOKENS_PER_MILLION) * pricing.inputPerMillionTokensUsd +
      (outputTokens / TOKENS_PER_MILLION) * pricing.outputPerMillionTokensUsd;

    return Math.round(cost * COST_ROUNDING_FACTOR) / COST_ROUNDING_FACTOR;
  }
}
