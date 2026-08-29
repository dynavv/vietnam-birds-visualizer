import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DiscoveryToast } from "./DiscoveryToast";
import type { BirdSpecies } from "../../types/bird";

const mockSpecies: BirdSpecies = {
  id: "lophura-edwardsi",
  scientificName: "Lophura edwardsi",
  vietnameseName: "Gà lôi Lam mào trắng",
  englishName: "Edwards's Pheasant",
  taxonomy: {
    clade: ["Aves", "Galliformes"],
    order: "Galliformes",
    orderVietnamese: "Bộ Gà",
    family: "Phasianidae",
    familyVietnamese: "Họ Trĩ",
    genus: "Lophura",
    species: "L. edwardsi"
  },
  isEndemic: true,
  conservation: {
    iucn: "CR",
    description: "Cực kỳ nguy cấp"
  },
  morphologicalAnalysis: {
    overview: "Chim trĩ đặc hữu quý hiếm",
    diagnosticFeatures: [{ part: "Mào lông", description: "Mào trắng tinh" }]
  },
  distribution: {
    ebaRegion: "Vùng Đất thấp Miền Trung",
    elevation: "50-300m",
    habitats: ["Rừng thường xanh"],
    locations: ["Kẻ Gỗ"],
    coordinates: [18.25, 105.9]
  },
  illustration: {
    imageUrl: "https://example.com/bird.jpg",
    artist: "iNaturalist"
  },
  academic: {
    iocTaxonCode: "IOC-EDWARDSI",
    avibaseId: "AVI-EDWARDSI",
    iucnUrl: "https://example.com/iucn",
    gbifTaxonKey: "https://example.com/gbif"
  }
};

describe("DiscoveryToast Component", () => {
  it("renders species discovery notification with count", () => {
    render(
      <DiscoveryToast
        species={mockSpecies}
        discoveredCount={12}
        totalCount={68}
        isNewDiscovery={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByTestId("discovery-toast")).toBeDefined();
    expect(screen.getByText("✨ Đã Khám Phá Loài Mới!")).toBeDefined();
    expect(screen.getByText("12/68")).toBeDefined();
    expect(screen.getByText("Gà lôi Lam mào trắng")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <DiscoveryToast
        species={mockSpecies}
        discoveredCount={68}
        totalCount={68}
        isNewDiscovery={false}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText("Đóng thông báo");
    fireEvent.click(closeBtn);
  });
});
