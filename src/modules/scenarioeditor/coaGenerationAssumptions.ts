/** Declared ITDX engine assumptions returned by GET /assumptions. */

export interface CoaAssumptionsCatalog {
  terrain: {
    grid: {
      x_min_km: number;
      x_max_km: number;
      y_min_km: number;
      y_max_km: number;
      cell_km: number;
    };
    highways_y_km: number[];
    pl_boxcars_crossing_x_km: number;
    mobility: Record<string, number>;
    concealment: Record<string, number>;
  };
  transition: {
    stay_probability: number;
    task_diagonal_probability: number;
    phase_jitter_hours: number;
    marsh_outgoing_absorption_max: number;
    step_hours: number;
    beta: Record<string, number>;
    reinforcement: Record<string, number>;
  };
  priors: {
    hypotheses: Record<string, number>;
    hypothesis_leak_per_hour: number;
    initial_position_sigma_km: number;
    entropy: {
      coa_bits: number;
      top_two_gap: number;
      entity_bits: number;
    };
    projection_hours: number;
  };
  observation: {
    sensors: Record<
      string,
      { p_sensor: number; default_reliability: string; optical: boolean }
    >;
    reliability_gamma: Record<string, number>;
    false_positive_per_cell: number;
    negative_info_report_exclusion_radius_cells: number;
    confusion: Record<string, Record<string, number>>;
    activity_task: Record<string, Record<string, number>>;
  };
  weather: {
    optical_night_base: number;
    optical_moon_weight: number;
    precip_mod: Record<string, number>;
    visibility_mod: Record<string, number>;
  };
  scenario: {
    traffic?: { enabled?: boolean; path?: string; limit?: number | null };
    end?: string;
    shift_at?: string;
    shift_to?: string;
  };
  isr: {
    degraded_window: { start: string; end: string };
    imint_pass_minutes: string[];
    uas_cycle_on_hours: number;
    uas_cycle_off_hours: number;
  };
  entities: {
    id: string;
    name: string;
    type: string;
    start_km: [number, number];
    road_kph: number;
    cross_kph: number;
  }[];
  runtime?: {
    seed: number | null;
    ground_truth: string;
    window_start: string;
    window_end: string;
    step_count: number;
    active_priors: Record<string, number>;
  };
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function formatRecord(record: Record<string, number>): string {
  return Object.entries(record)
    .map(([key, value]) => `${key} ${formatPercent(value)}`)
    .join(", ");
}
